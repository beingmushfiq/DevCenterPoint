/* ============================================================
   ADMIN INSIGHTS / POSTS ROUTE
   ============================================================ */

import { Router } from 'express';
import * as Admin from '../../models/admin.js';
import { renderAdmin } from '../../lib/admin-render.js';

export const postsRouter = Router();

postsRouter.get('/', async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const status = req.query.status || '';
    const items = await Admin.listAllPosts({ search, status });

    renderAdmin(req, res, 'admin/posts/index', {
      title: 'Insights',
      breadcrumb: 'Insights',
      items,
      search,
      status,
      topActions: '<a class="btn btn--primary" href="/admin/posts/new">+ New Article</a>',
    });
  } catch (err) {
    next(err);
  }
});

postsRouter.get('/new', async (req, res, next) => {
  try {
    const [mediaList, tags] = await Promise.all([
      Admin.listMedia({ limit: 100 }),
      Admin.listAllTags(),
    ]);

    renderAdmin(req, res, 'admin/posts/edit', {
      title: 'New Article',
      breadcrumb: 'Insights / New',
      post: {
        id: null,
        slug: '',
        title: '',
        excerpt: '',
        body: '',
        cover_media_id: null,
        status: 'draft',
        is_featured: 0,
        seo_title: '',
        seo_description: '',
        tags: [],
      },
      mediaList,
      tags,
      errors: null,
    });
  } catch (err) {
    next(err);
  }
});

postsRouter.post('/new', async (req, res, next) => {
  try {
    const b = req.body;
    const tags = b.tags ? String(b.tags).split(',').map((t) => t.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean) : [];

    const data = {
      slug: (b.slug || b.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: b.title,
      excerpt: b.excerpt,
      body: b.body,
      cover_media_id: b.cover_media_id ? Number(b.cover_media_id) : null,
      status: b.status || 'draft',
      is_featured: b.is_featured === '1',
      seo_title: b.seo_title,
      seo_description: b.seo_description,
      tags,
    };

    await Admin.savePost(null, data, req.session.userId);
    res.redirect(`/admin/posts?msg=${encodeURIComponent('Article created successfully.')}`);
  } catch (err) {
    next(err);
  }
});

postsRouter.get('/:id/edit', async (req, res, next) => {
  try {
    const post = await Admin.getPostForEdit(req.params.id);
    if (!post) return res.status(404).send('Post not found');

    const [mediaList, tags] = await Promise.all([
      Admin.listMedia({ limit: 100 }),
      Admin.listAllTags(),
    ]);

    renderAdmin(req, res, 'admin/posts/edit', {
      title: `Edit: ${post.title}`,
      breadcrumb: `Insights / ${post.title}`,
      post,
      mediaList,
      tags,
      errors: null,
    });
  } catch (err) {
    next(err);
  }
});

postsRouter.post('/:id/edit', async (req, res, next) => {
  try {
    const b = req.body;
    const tags = b.tags ? String(b.tags).split(',').map((t) => t.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean) : [];

    const data = {
      slug: (b.slug || b.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: b.title,
      excerpt: b.excerpt,
      body: b.body,
      cover_media_id: b.cover_media_id ? Number(b.cover_media_id) : null,
      status: b.status || 'draft',
      is_featured: b.is_featured === '1',
      seo_title: b.seo_title,
      seo_description: b.seo_description,
      tags,
    };

    await Admin.savePost(req.params.id, data, req.session.userId);
    res.redirect(`/admin/posts?msg=${encodeURIComponent('Article saved successfully.')}`);
  } catch (err) {
    next(err);
  }
});

postsRouter.post('/:id/delete', async (req, res, next) => {
  try {
    await Admin.deletePost(req.params.id, req.session.userId);
    res.redirect(`/admin/posts?msg=${encodeURIComponent('Article deleted.')}`);
  } catch (err) {
    next(err);
  }
});
