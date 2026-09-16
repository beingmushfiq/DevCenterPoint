/* ============================================================
   ADMIN PAGES ROUTE
   ============================================================ */

import { Router } from 'express';
import * as Admin from '../../models/admin.js';
import { renderAdmin } from '../../lib/admin-render.js';

export const pagesRouter = Router();

pagesRouter.get('/', async (req, res, next) => {
  try {
    const items = await Admin.listAllAdminPages();
    renderAdmin(req, res, 'admin/pages/index', {
      title: 'Pages',
      breadcrumb: 'Pages',
      items,
      topActions: '<a class="btn btn--primary" href="/admin/pages/new">+ New Page</a>',
    });
  } catch (err) {
    next(err);
  }
});

pagesRouter.get('/new', (req, res) => {
  renderAdmin(req, res, 'admin/pages/edit', {
    title: 'New Page',
    breadcrumb: 'Pages / New',
    page: {
      id: null,
      slug: '',
      title: '',
      heading: '',
      lede: '',
      body: '',
      template: 'generic',
      show_in_nav: 0,
      status: 'draft',
      seo_title: '',
      seo_description: '',
    },
  });
});

pagesRouter.post('/new', async (req, res, next) => {
  try {
    const b = req.body;
    const data = {
      slug: (b.slug || b.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: b.title,
      heading: b.heading,
      lede: b.lede,
      body: b.body,
      template: b.template || 'generic',
      show_in_nav: b.show_in_nav === '1',
      status: b.status || 'draft',
      seo_title: b.seo_title,
      seo_description: b.seo_description,
    };
    await Admin.savePage(null, data, req.session.userId);
    res.redirect(`/admin/pages?msg=${encodeURIComponent('Page created.')}`);
  } catch (err) {
    next(err);
  }
});

pagesRouter.get('/:id/edit', async (req, res, next) => {
  try {
    const page = await Admin.getPageForEdit(req.params.id);
    if (!page) return res.status(404).send('Page not found');

    renderAdmin(req, res, 'admin/pages/edit', {
      title: `Edit: ${page.title}`,
      breadcrumb: `Pages / ${page.title}`,
      page,
    });
  } catch (err) {
    next(err);
  }
});

pagesRouter.post('/:id/edit', async (req, res, next) => {
  try {
    const b = req.body;
    const data = {
      slug: (b.slug || b.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: b.title,
      heading: b.heading,
      lede: b.lede,
      body: b.body,
      template: b.template || 'generic',
      show_in_nav: b.show_in_nav === '1',
      status: b.status || 'draft',
      seo_title: b.seo_title,
      seo_description: b.seo_description,
    };
    await Admin.savePage(req.params.id, data, req.session.userId);
    res.redirect(`/admin/pages?msg=${encodeURIComponent('Page updated.')}`);
  } catch (err) {
    next(err);
  }
});

pagesRouter.post('/:id/delete', async (req, res, next) => {
  try {
    await Admin.deletePage(req.params.id, req.session.userId);
    res.redirect(`/admin/pages?msg=${encodeURIComponent('Page deleted.')}`);
  } catch (err) {
    next(err);
  }
});
