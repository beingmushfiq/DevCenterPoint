/* ============================================================
   ADMIN UPDATES & NEWS ROUTE
   ============================================================ */

import { Router } from 'express';
import * as Admin from '../../models/admin.js';
import { renderAdmin } from '../../lib/admin-render.js';

export const updatesRouter = Router();

updatesRouter.get('/', async (req, res, next) => {
  try {
    const items = await Admin.listAdminUpdates();
    renderAdmin(req, res, 'admin/updates/index', {
      title: 'Company Updates',
      breadcrumb: 'Updates',
      items,
      topActions: '<a class="btn btn--primary" href="/admin/updates/new">+ New Update</a>',
    });
  } catch (err) {
    next(err);
  }
});

updatesRouter.get('/new', (req, res) => {
  renderAdmin(req, res, 'admin/updates/edit', {
    title: 'New Update',
    breadcrumb: 'Updates / New',
    entry: {
      id: null,
      version_tag: '',
      title: '',
      slug: '',
      category: 'feature',
      summary: '',
      body: '',
      is_featured: 0,
      sort_order: 0,
      status: 'published',
      published_at: new Date().toISOString().slice(0, 10),
    },
  });
});

updatesRouter.post('/new', async (req, res, next) => {
  try {
    const b = req.body;
    const slug = b.slug || b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const data = {
      version_tag: b.version_tag || null,
      title: b.title,
      slug,
      category: b.category || 'feature',
      summary: b.summary || '',
      body: b.body || '',
      published_at: b.published_at ? new Date(b.published_at) : new Date(),
      is_featured: !!b.is_featured,
      sort_order: parseInt(b.sort_order, 10) || 0,
      status: b.status || 'published',
    };
    await Admin.createUpdate(data, req.session.userId);
    res.redirect(`/admin/updates?msg=${encodeURIComponent('Update published successfully.')}`);
  } catch (err) {
    next(err);
  }
});

updatesRouter.get('/:id/edit', async (req, res, next) => {
  try {
    const entry = await Admin.getUpdateById(req.params.id);
    if (!entry) return res.status(404).send('Update entry not found');

    if (entry.published_at instanceof Date) {
      entry.published_at = entry.published_at.toISOString().slice(0, 10);
    }

    renderAdmin(req, res, 'admin/updates/edit', {
      title: `Edit: ${entry.title}`,
      breadcrumb: `Updates / ${entry.title}`,
      entry,
    });
  } catch (err) {
    next(err);
  }
});

updatesRouter.post('/:id/edit', async (req, res, next) => {
  try {
    const b = req.body;
    const slug = b.slug || b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const data = {
      version_tag: b.version_tag || null,
      title: b.title,
      slug,
      category: b.category || 'feature',
      summary: b.summary || '',
      body: b.body || '',
      published_at: b.published_at ? new Date(b.published_at) : new Date(),
      is_featured: !!b.is_featured,
      sort_order: parseInt(b.sort_order, 10) || 0,
      status: b.status || 'published',
    };
    await Admin.updateUpdate(req.params.id, data, req.session.userId);
    res.redirect(`/admin/updates?msg=${encodeURIComponent('Update saved.')}`);
  } catch (err) {
    next(err);
  }
});

updatesRouter.post('/:id/delete', async (req, res, next) => {
  try {
    await Admin.deleteUpdate(req.params.id, req.session.userId);
    res.redirect(`/admin/updates?msg=${encodeURIComponent('Update deleted.')}`);
  } catch (err) {
    next(err);
  }
});
