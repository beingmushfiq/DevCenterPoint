/* ============================================================
   ADMIN CONTENT & WRITE MODELS
   Prepared statements, audit logging, transactions for collections.
   ============================================================ */

import { query, execute, one, transaction } from '../db/pool.js';
import { invalidateGlobals } from '../middleware/globals.js';
import { readingTime } from '../lib/markdown.js';

/* ---------------------------------------------------------------
   AUDIT LOG
   --------------------------------------------------------------- */

export async function audit(userId, action, entityType, entityId, summary = '') {
  try {
    await execute(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, summary)
       VALUES (?, ?, ?, ?, ?)`,
      [userId || null, action, entityType, String(entityId || ''), summary.slice(0, 500)]
    );
  } catch (err) {
    console.error('Audit logging failed:', err.message);
  }
}

/* ---------------------------------------------------------------
   USERS & AUTH
   --------------------------------------------------------------- */

export async function getUserByEmail(email) {
  return one('SELECT * FROM users WHERE email = ? LIMIT 1', [String(email || '').trim().toLowerCase()]);
}

export async function getUserById(id) {
  return one('SELECT id, email, display_name, role, last_login_at FROM users WHERE id = ? LIMIT 1', [id]);
}

export async function updateUserLastLogin(userId) {
  await execute('UPDATE users SET last_login_at = NOW(), failed_attempts = 0 WHERE id = ?', [userId]);
}

export async function recordFailedLogin(userId) {
  await execute('UPDATE users SET failed_attempts = failed_attempts + 1 WHERE id = ?', [userId]);
}

/* ---------------------------------------------------------------
   DASHBOARD STATS
   --------------------------------------------------------------- */

export async function getDashboardStats() {
  const [
    casesCount,
    postsCount,
    servicesCount,
    submissionsCount,
    unreadSubmissions,
    recentSubmissions,
    recentAudits,
  ] = await Promise.all([
    one("SELECT COUNT(*) AS c FROM case_studies WHERE status = 'published'"),
    one("SELECT COUNT(*) AS c FROM posts WHERE status = 'published'"),
    one("SELECT COUNT(*) AS c FROM services WHERE status = 'published'"),
    one('SELECT COUNT(*) AS c FROM contact_submissions'),
    one('SELECT COUNT(*) AS c FROM contact_submissions WHERE is_read = 0'),
    execute('SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 5'),
    execute(
      `SELECT a.*, u.display_name, u.email
         FROM audit_log a
         LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.created_at DESC
        LIMIT 8`
    ),
  ]);

  return {
    cases: casesCount ? casesCount.c : 0,
    posts: postsCount ? postsCount.c : 0,
    services: servicesCount ? servicesCount.c : 0,
    submissions: submissionsCount ? submissionsCount.c : 0,
    unreadSubmissions: unreadSubmissions ? unreadSubmissions.c : 0,
    recentSubmissions,
    recentAudits,
  };
}

/* ---------------------------------------------------------------
   CASE STUDIES CRUD
   --------------------------------------------------------------- */

export async function listAllCaseStudies({ search = '', sector = '' } = {}) {
  const params = [];
  const where = ['1=1'];
  if (search) {
    where.push('(title LIKE ? OR client_name LIKE ? OR summary LIKE ?)');
    const q = `%${search}%`;
    params.push(q, q, q);
  }
  if (sector) {
    where.push('sector = ?');
    params.push(sector);
  }
  return execute(
    `SELECT cs.*, m.path AS cover_path
       FROM case_studies cs
       LEFT JOIN media m ON m.id = cs.cover_media_id
      WHERE ${where.join(' AND ')}
      ORDER BY cs.sort_order, cs.id DESC`,
    params
  );
}

export async function getCaseStudyForEdit(id) {
  const cs = await one('SELECT * FROM case_studies WHERE id = ?', [id]);
  if (!cs) return null;

  const [metrics, techRows, imageRows, serviceRows] = await Promise.all([
    execute('SELECT * FROM case_study_metrics WHERE case_study_id = ? ORDER BY sort_order, id', [id]),
    execute('SELECT label FROM case_study_tech WHERE case_study_id = ? ORDER BY sort_order, id', [id]),
    execute(
      `SELECT csi.*, m.path, m.alt_text
         FROM case_study_images csi
         JOIN media m ON m.id = csi.media_id
        WHERE csi.case_study_id = ?
        ORDER BY csi.sort_order, csi.id`,
      [id]
    ),
    execute('SELECT service_id FROM case_study_services WHERE case_study_id = ?', [id]),
  ]);

  return {
    ...cs,
    metrics,
    tech: techRows.map((t) => t.label),
    images: imageRows,
    serviceIds: serviceRows.map((s) => s.service_id),
  };
}

export async function saveCaseStudy(id, data, userId) {
  const isNew = !id;
  return transaction(async (conn) => {
    let caseId = id;
    if (isNew) {
      const [res] = await conn.execute(
        `INSERT INTO case_studies (
           slug, title, client_name, client_visibility, client_label,
           sector, engagement, year, duration, team_size, summary,
           challenge, approach, outcome, quote, quote_attribution,
           cover_media_id, cover_alt, is_featured, sort_order, status,
           seo_title, seo_description, published_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.slug, data.title, data.client_name || '', data.client_visibility || 'named', data.client_label || '',
          data.sector || '', data.engagement || '', data.year || new Date().getFullYear(), data.duration || '',
          data.team_size || '', data.summary || '', data.challenge || '', data.approach || '',
          data.outcome || '', data.quote || '', data.quote_attribution || '',
          data.cover_media_id || null, data.cover_alt || '', data.is_featured ? 1 : 0,
          data.sort_order || 0, data.status || 'draft',
          data.seo_title || null, data.seo_description || null,
          data.status === 'published' ? (data.published_at || new Date().toISOString().slice(0, 19).replace('T', ' ')) : null,
        ]
      );
      caseId = res.insertId;
      await audit(userId, 'create', 'case_study', caseId, `Created case study: ${data.title}`);
    } else {
      await conn.execute(
        `UPDATE case_studies SET
           slug = ?, title = ?, client_name = ?, client_visibility = ?, client_label = ?,
           sector = ?, engagement = ?, year = ?, duration = ?, team_size = ?, summary = ?,
           challenge = ?, approach = ?, outcome = ?, quote = ?, quote_attribution = ?,
           cover_media_id = ?, cover_alt = ?, is_featured = ?, sort_order = ?, status = ?,
           seo_title = ?, seo_description = ?, updated_at = NOW(),
           published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END
         WHERE id = ?`,
        [
          data.slug, data.title, data.client_name || '', data.client_visibility || 'named', data.client_label || '',
          data.sector || '', data.engagement || '', data.year || new Date().getFullYear(), data.duration || '',
          data.team_size || '', data.summary || '', data.challenge || '', data.approach || '',
          data.outcome || '', data.quote || '', data.quote_attribution || '',
          data.cover_media_id || null, data.cover_alt || '', data.is_featured ? 1 : 0,
          data.sort_order || 0, data.status || 'draft',
          data.seo_title || null, data.seo_description || null,
          data.status,
          caseId,
        ]
      );
      await audit(userId, 'update', 'case_study', caseId, `Updated case study: ${data.title}`);
    }

    // Sync metrics
    await conn.execute('DELETE FROM case_study_metrics WHERE case_study_id = ?', [caseId]);
    if (Array.isArray(data.metrics)) {
      for (let i = 0; i < data.metrics.length; i++) {
        const m = data.metrics[i];
        if (m.label && m.value) {
          await conn.execute(
            `INSERT INTO case_study_metrics (case_study_id, label, value, unit, prefix, note, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [caseId, m.label, m.value, m.unit || '', m.prefix || '', m.note || '', i]
          );
        }
      }
    }

    // Sync tech
    await conn.execute('DELETE FROM case_study_tech WHERE case_study_id = ?', [caseId]);
    if (Array.isArray(data.tech)) {
      for (let i = 0; i < data.tech.length; i++) {
        const t = String(data.tech[i]).trim();
        if (t) {
          await conn.execute(
            'INSERT INTO case_study_tech (case_study_id, label, sort_order) VALUES (?, ?, ?)',
            [caseId, t, i]
          );
        }
      }
    }

    // Sync services
    await conn.execute('DELETE FROM case_study_services WHERE case_study_id = ?', [caseId]);
    if (Array.isArray(data.serviceIds)) {
      for (const sId of data.serviceIds) {
        if (sId) {
          await conn.execute(
            'INSERT INTO case_study_services (case_study_id, service_id) VALUES (?, ?)',
            [caseId, sId]
          );
        }
      }
    }

    return caseId;
  });
}

export async function deleteCaseStudy(id, userId) {
  const cs = await one('SELECT title FROM case_studies WHERE id = ?', [id]);
  await execute('DELETE FROM case_studies WHERE id = ?', [id]);
  await audit(userId, 'delete', 'case_study', id, `Deleted case study: ${cs?.title || id}`);
}

/* ---------------------------------------------------------------
   POSTS & TAGS CRUD
   --------------------------------------------------------------- */

export async function listAllPosts({ search = '', status = '' } = {}) {
  const where = ['1=1'];
  const params = [];
  if (search) {
    where.push('(p.title LIKE ? OR p.excerpt LIKE ?)');
    const q = `%${search}%`;
    params.push(q, q);
  }
  if (status) {
    where.push('p.status = ?');
    params.push(status);
  }
  return execute(
    `SELECT p.*, m.path AS cover_path, u.display_name AS author_name
       FROM posts p
       LEFT JOIN media m ON m.id = p.cover_media_id
       LEFT JOIN users u ON u.id = p.author_id
      WHERE ${where.join(' AND ')}
      ORDER BY p.id DESC`,
    params
  );
}

export async function getPostForEdit(id) {
  const post = await one('SELECT * FROM posts WHERE id = ?', [id]);
  if (!post) return null;

    const tagRows = await execute(
      `SELECT t.slug, t.label
         FROM post_tags pt
         JOIN tags t ON t.id = pt.tag_id
        WHERE pt.post_id = ?`,
      [id]
    );
    return { ...post, tags: tagRows.map((t) => t.slug) };
  }

  export async function listAllTags() {
    return query('SELECT * FROM tags ORDER BY label');
  }

  export async function savePost(id, data, userId) {
    const isNew = !id;
    const readMins = readingTime(data.body || '');

    return transaction(async (conn) => {
      let postId = id;
      if (isNew) {
        const [res] = await conn.execute(
          `INSERT INTO posts (
             slug, title, excerpt, body, cover_media_id, author_id,
             reading_time, status, is_featured, seo_title, seo_description, published_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.slug, data.title, data.excerpt || '', data.body || '',
            data.cover_media_id || null, userId, readMins,
            data.status || 'draft', data.is_featured ? 1 : 0,
            data.seo_title || null, data.seo_description || null,
            data.status === 'published' ? (data.published_at || new Date().toISOString().slice(0, 19).replace('T', ' ')) : null,
          ]
        );
        postId = res.insertId;
        await audit(userId, 'create', 'post', postId, `Created post: ${data.title}`);
      } else {
        await conn.execute(
          `UPDATE posts SET
             slug = ?, title = ?, excerpt = ?, body = ?, cover_media_id = ?,
             reading_time = ?, status = ?, is_featured = ?, seo_title = ?, seo_description = ?,
             updated_at = NOW(),
             published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END
           WHERE id = ?`,
          [
            data.slug, data.title, data.excerpt || '', data.body || '',
            data.cover_media_id || null, readMins,
            data.status || 'draft', data.is_featured ? 1 : 0,
            data.seo_title || null, data.seo_description || null,
            data.status,
            postId,
          ]
        );
        await audit(userId, 'update', 'post', postId, `Updated post: ${data.title}`);
      }

      // Sync tags
      await conn.execute('DELETE FROM post_tags WHERE post_id = ?', [postId]);
      if (Array.isArray(data.tags)) {
        for (const tagSlug of data.tags) {
          if (!tagSlug) continue;
          const [tag] = await conn.execute('SELECT id FROM tags WHERE slug = ?', [tagSlug]);
          let tagId = tag[0]?.id;
          if (!tagId) {
            const label = tagSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            const [newTag] = await conn.execute('INSERT INTO tags (slug, label) VALUES (?, ?)', [tagSlug, label]);
            tagId = newTag.insertId;
          }
          await conn.execute('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)', [postId, tagId]);
        }
      }

    return postId;
  });
}

export async function deletePost(id, userId) {
  const post = await one('SELECT title FROM posts WHERE id = ?', [id]);
  await execute('DELETE FROM posts WHERE id = ?', [id]);
  await audit(userId, 'delete', 'post', id, `Deleted post: ${post?.title || id}`);
}

/* ---------------------------------------------------------------
   SERVICES CRUD
   --------------------------------------------------------------- */

export async function listAllAdminServices() {
  return query('SELECT * FROM services ORDER BY sort_order, id');
}

export async function getServiceForEdit(id) {
  const s = await one('SELECT * FROM services WHERE id = ?', [id]);
  if (!s) return null;
  const delivs = await execute(
    'SELECT id, label, sort_order FROM service_deliverables WHERE service_id = ? ORDER BY sort_order, id',
    [id]
  );
  return { ...s, deliverables: delivs.map((d) => d.label) };
}

export async function saveService(id, data, userId) {
  const isNew = !id;
  return transaction(async (conn) => {
    let serviceId = id;
    if (isNew) {
      const [res] = await conn.execute(
        `INSERT INTO services (slug, title, tagline, summary, body, icon_key, sort_order, is_featured, status, seo_title, seo_description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.slug, data.title, data.tagline || '', data.summary || '',
          data.body || '', data.icon_key || 'mark', data.sort_order || 0,
          data.is_featured ? 1 : 0, data.status || 'draft',
          data.seo_title || null, data.seo_description || null,
        ]
      );
      serviceId = res.insertId;
      await audit(userId, 'create', 'service', serviceId, `Created service: ${data.title}`);
    } else {
      await conn.execute(
        `UPDATE services SET
           slug = ?, title = ?, tagline = ?, summary = ?, body = ?,
           icon_key = ?, sort_order = ?, is_featured = ?, status = ?,
           seo_title = ?, seo_description = ?
         WHERE id = ?`,
        [
          data.slug, data.title, data.tagline || '', data.summary || '',
          data.body || '', data.icon_key || 'mark', data.sort_order || 0,
          data.is_featured ? 1 : 0, data.status || 'draft',
          data.seo_title || null, data.seo_description || null,
          serviceId,
        ]
      );
      await audit(userId, 'update', 'service', serviceId, `Updated service: ${data.title}`);
    }

    // Deliverables
    await conn.execute('DELETE FROM service_deliverables WHERE service_id = ?', [serviceId]);
    if (Array.isArray(data.deliverables)) {
      for (let i = 0; i < data.deliverables.length; i++) {
        const d = String(data.deliverables[i]).trim();
        if (d) {
          await conn.execute(
            'INSERT INTO service_deliverables (service_id, label, sort_order) VALUES (?, ?, ?)',
            [serviceId, d, i]
          );
        }
      }
    }

    return serviceId;
  });
}

export async function deleteService(id, userId) {
  const s = await one('SELECT title FROM services WHERE id = ?', [id]);
  await execute('DELETE FROM services WHERE id = ?', [id]);
  await audit(userId, 'delete', 'service', id, `Deleted service: ${s?.title || id}`);
}

/* ---------------------------------------------------------------
   TEAM CRUD
   --------------------------------------------------------------- */

export async function listAllTeamMembers() {
  return query(`
    SELECT t.*, m.path AS photo_path
      FROM team_members t
      LEFT JOIN media m ON m.id = t.photo_media_id
     ORDER BY t.sort_order, t.id
  `);
}

export async function getTeamMemberForEdit(id) {
  return one('SELECT * FROM team_members WHERE id = ?', [id]);
}

export async function saveTeamMember(id, data, userId) {
  if (!id) {
    const [res] = await execute(
      `INSERT INTO team_members (name, role, bio, photo_media_id, location, email, sort_order, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name, data.role || '', data.bio || '', data.photo_media_id || null,
        data.location || '', data.email || '', data.sort_order || 0, data.status || 'active',
      ]
    );
    await audit(userId, 'create', 'team_member', res.insertId, `Added team member: ${data.name}`);
    return res.insertId;
  }
  await execute(
    `UPDATE team_members SET
       name = ?, role = ?, bio = ?, photo_media_id = ?,
       location = ?, email = ?, sort_order = ?, status = ?
     WHERE id = ?`,
    [
      data.name, data.role || '', data.bio || '', data.photo_media_id || null,
      data.location || '', data.email || '', data.sort_order || 0, data.status || 'active',
      id,
    ]
  );
  await audit(userId, 'update', 'team_member', id, `Updated team member: ${data.name}`);
  return id;
}

export async function deleteTeamMember(id, userId) {
  const t = await one('SELECT name FROM team_members WHERE id = ?', [id]);
  await execute('DELETE FROM team_members WHERE id = ?', [id]);
  await audit(userId, 'delete', 'team_member', id, `Deleted team member: ${t?.name || id}`);
}

/* ---------------------------------------------------------------
   TESTIMONIALS CRUD
   --------------------------------------------------------------- */

export async function listAllAdminTestimonials() {
  return query('SELECT * FROM testimonials ORDER BY sort_order, id DESC');
}

export async function getTestimonialForEdit(id) {
  return one('SELECT * FROM testimonials WHERE id = ?', [id]);
}

export async function saveTestimonial(id, data, userId) {
  if (!id) {
    const [res] = await execute(
      `INSERT INTO testimonials (quote, attribution, role, company, avatar_media_id, case_study_id, sort_order, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.quote, data.attribution, data.role || '', data.company || '',
        data.avatar_media_id || null, data.case_study_id || null, data.sort_order || 0, data.status || 'active',
      ]
    );
    await audit(userId, 'create', 'testimonial', res.insertId, `Created testimonial by ${data.attribution}`);
    return res.insertId;
  }
  await execute(
    `UPDATE testimonials SET
       quote = ?, attribution = ?, role = ?, company = ?,
       avatar_media_id = ?, case_study_id = ?, sort_order = ?, status = ?
     WHERE id = ?`,
    [
      data.quote, data.attribution, data.role || '', data.company || '',
      data.avatar_media_id || null, data.case_study_id || null, data.sort_order || 0, data.status || 'active',
      id,
    ]
  );
  await audit(userId, 'update', 'testimonial', id, `Updated testimonial by ${data.attribution}`);
  return id;
}

export async function deleteTestimonial(id, userId) {
  await execute('DELETE FROM testimonials WHERE id = ?', [id]);
  await audit(userId, 'delete', 'testimonial', id, 'Deleted testimonial');
}

/* ---------------------------------------------------------------
   FAQS CRUD
   --------------------------------------------------------------- */

export async function listAllAdminFaqs() {
  return query('SELECT * FROM faqs ORDER BY sort_order, id');
}

export async function getFaqForEdit(id) {
  return one('SELECT * FROM faqs WHERE id = ?', [id]);
}

export async function saveFaq(id, data, userId) {
  if (!id) {
    const [res] = await execute(
      'INSERT INTO faqs (question, answer, category, sort_order, status) VALUES (?, ?, ?, ?, ?)',
      [data.question, data.answer, data.category || 'General', data.sort_order || 0, data.status || 'active']
    );
    await audit(userId, 'create', 'faq', res.insertId, `Created FAQ: ${data.question.slice(0, 60)}`);
    return res.insertId;
  }
  await execute(
    'UPDATE faqs SET question = ?, answer = ?, category = ?, sort_order = ?, status = ? WHERE id = ?',
    [data.question, data.answer, data.category || 'General', data.sort_order || 0, data.status || 'active', id]
  );
  await audit(userId, 'update', 'faq', id, `Updated FAQ: ${data.question.slice(0, 60)}`);
  return id;
}

export async function deleteFaq(id, userId) {
  await execute('DELETE FROM faqs WHERE id = ?', [id]);
  await audit(userId, 'delete', 'faq', id, 'Deleted FAQ');
}

/* ---------------------------------------------------------------
   PAGES CRUD
   --------------------------------------------------------------- */

export async function listAllAdminPages() {
  return query('SELECT * FROM pages ORDER BY title');
}

export async function getPageForEdit(id) {
  return one('SELECT * FROM pages WHERE id = ?', [id]);
}

export async function savePage(id, data, userId) {
  if (!id) {
    const [res] = await execute(
      `INSERT INTO pages (slug, title, heading, lede, body, template, show_in_nav, status, seo_title, seo_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.slug, data.title, data.heading || '', data.lede || '', data.body || '',
        data.template || 'generic', data.show_in_nav ? 1 : 0, data.status || 'draft',
        data.seo_title || null, data.seo_description || null,
      ]
    );
    await audit(userId, 'create', 'page', res.insertId, `Created page: ${data.title}`);
    return res.insertId;
  }
  await execute(
    `UPDATE pages SET
       slug = ?, title = ?, heading = ?, lede = ?, body = ?,
       template = ?, show_in_nav = ?, status = ?,
       seo_title = ?, seo_description = ?, updated_at = NOW()
     WHERE id = ?`,
    [
      data.slug, data.title, data.heading || '', data.lede || '', data.body || '',
      data.template || 'generic', data.show_in_nav ? 1 : 0, data.status || 'draft',
      data.seo_title || null, data.seo_description || null,
      id,
    ]
  );
  await audit(userId, 'update', 'page', id, `Updated page: ${data.title}`);
  return id;
}

export async function deletePage(id, userId) {
  const p = await one('SELECT title FROM pages WHERE id = ?', [id]);
  await execute('DELETE FROM pages WHERE id = ?', [id]);
  await audit(userId, 'delete', 'page', id, `Deleted page: ${p?.title || id}`);
}

/* ---------------------------------------------------------------
   CONTACT SUBMISSIONS
   --------------------------------------------------------------- */

export async function listSubmissions({ limit = 20, offset = 0 } = {}) {
  return execute(
    `SELECT * FROM contact_submissions
      ORDER BY created_at DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}`
  );
}

export async function countSubmissions() {
  const row = await one('SELECT COUNT(*) AS c FROM contact_submissions');
  return row ? row.c : 0;
}

export async function getSubmissionById(id) {
  return one('SELECT * FROM contact_submissions WHERE id = ?', [id]);
}

export async function markSubmissionRead(id, isRead = 1) {
  await execute('UPDATE contact_submissions SET is_read = ? WHERE id = ?', [isRead ? 1 : 0, id]);
}

export async function deleteSubmission(id, userId) {
  await execute('DELETE FROM contact_submissions WHERE id = ?', [id]);
  await audit(userId, 'delete', 'submission', id, 'Deleted contact submission');
}

/* ---------------------------------------------------------------
   SETTINGS & NAV
   --------------------------------------------------------------- */

export async function getAllSettingsList() {
  return query('SELECT * FROM site_settings ORDER BY setting_key');
}

export async function updateSettings(settingsMap, userId) {
  for (const [k, v] of Object.entries(settingsMap)) {
    const val = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '');
    await execute(
      `INSERT INTO site_settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [k, val, val]
    );
  }
  invalidateGlobals();
  await audit(userId, 'update', 'settings', 0, 'Updated site settings');
}

export async function listAllNavItems() {
  return query('SELECT * FROM nav_items ORDER BY location, sort_order, id');
}

export async function saveNavItems(items, userId) {
  return transaction(async (conn) => {
    await conn.execute('DELETE FROM nav_items');
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.label && item.url) {
        await conn.execute(
          `INSERT INTO nav_items (location, label, url, sort_order, is_external, is_active)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            item.location || 'primary',
            item.label,
            item.url,
            i,
            item.is_external ? 1 : 0,
            item.is_active !== false ? 1 : 0,
          ]
        );
      }
    }
    invalidateGlobals();
    await audit(userId, 'update', 'nav', 0, 'Updated navigation menu');
  });
}

/* ---------------------------------------------------------------
   MEDIA LIBRARY
   --------------------------------------------------------------- */

export async function listMedia({ limit = 30, offset = 0 } = {}) {
  return execute(
    `SELECT * FROM media
      ORDER BY id DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}`
  );
}

export async function countMedia() {
  const row = await one('SELECT COUNT(*) AS c FROM media');
  return row ? row.c : 0;
}

export async function createMedia(data, userId) {
  const [res] = await execute(
    `INSERT INTO media (filename, original_name, path, mime_type, size_bytes, width, height, alt_text, caption, folder, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.filename, data.original_name || data.filename, data.path,
      data.mime_type || 'image/jpeg', data.size_bytes || 0,
      data.width || null, data.height || null, data.alt_text || '',
      data.caption || '', data.folder || 'uploads', userId || null,
    ]
  );
  await audit(userId, 'create', 'media', res.insertId, `Uploaded media: ${data.original_name || data.filename}`);
  return res.insertId;
}

export async function deleteMedia(id, userId) {
  const m = await one('SELECT original_name, path FROM media WHERE id = ?', [id]);
  await execute('DELETE FROM media WHERE id = ?', [id]);
  await audit(userId, 'delete', 'media', id, `Deleted media: ${m?.original_name || id}`);
  return m;
}
