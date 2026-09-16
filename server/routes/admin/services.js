/* ============================================================
   ADMIN SERVICES ROUTE
   ============================================================ */

import { Router } from 'express';
import * as Admin from '../../models/admin.js';
import { renderAdmin } from '../../lib/admin-render.js';

export const servicesRouter = Router();

servicesRouter.get('/', async (req, res, next) => {
  try {
    const items = await Admin.listAllAdminServices();
    renderAdmin(req, res, 'admin/services/index', {
      title: 'Services',
      breadcrumb: 'Services',
      items,
      topActions: '<a class="btn btn--primary" href="/admin/services/new">+ New Service</a>',
    });
  } catch (err) {
    next(err);
  }
});

servicesRouter.get('/new', (req, res) => {
  renderAdmin(req, res, 'admin/services/edit', {
    title: 'New Service',
    breadcrumb: 'Services / New',
    service: {
      id: null,
      slug: '',
      title: '',
      tagline: '',
      summary: '',
      body: '',
      icon_key: 'stack',
      sort_order: 0,
      is_featured: 1,
      status: 'draft',
      seo_title: '',
      seo_description: '',
      deliverables: [],
    },
  });
});

servicesRouter.post('/new', async (req, res, next) => {
  try {
    const b = req.body;
    const deliverables = b.deliverables ? String(b.deliverables).split('\n').map((d) => d.trim()).filter(Boolean) : [];

    const data = {
      slug: (b.slug || b.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: b.title,
      tagline: b.tagline,
      summary: b.summary,
      body: b.body,
      icon_key: b.icon_key || 'stack',
      sort_order: parseInt(b.sort_order, 10) || 0,
      is_featured: b.is_featured === '1',
      status: b.status || 'draft',
      seo_title: b.seo_title,
      seo_description: b.seo_description,
      deliverables,
    };

    await Admin.saveService(null, data, req.session.userId);
    res.redirect(`/admin/services?msg=${encodeURIComponent('Service created.')}`);
  } catch (err) {
    next(err);
  }
});

servicesRouter.get('/:id/edit', async (req, res, next) => {
  try {
    const service = await Admin.getServiceForEdit(req.params.id);
    if (!service) return res.status(404).send('Service not found');

    renderAdmin(req, res, 'admin/services/edit', {
      title: `Edit: ${service.title}`,
      breadcrumb: `Services / ${service.title}`,
      service,
    });
  } catch (err) {
    next(err);
  }
});

servicesRouter.post('/:id/edit', async (req, res, next) => {
  try {
    const b = req.body;
    const deliverables = b.deliverables ? String(b.deliverables).split('\n').map((d) => d.trim()).filter(Boolean) : [];

    const data = {
      slug: (b.slug || b.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: b.title,
      tagline: b.tagline,
      summary: b.summary,
      body: b.body,
      icon_key: b.icon_key || 'stack',
      sort_order: parseInt(b.sort_order, 10) || 0,
      is_featured: b.is_featured === '1',
      status: b.status || 'draft',
      seo_title: b.seo_title,
      seo_description: b.seo_description,
      deliverables,
    };

    await Admin.saveService(req.params.id, data, req.session.userId);
    res.redirect(`/admin/services?msg=${encodeURIComponent('Service updated.')}`);
  } catch (err) {
    next(err);
  }
});

servicesRouter.post('/:id/delete', async (req, res, next) => {
  try {
    await Admin.deleteService(req.params.id, req.session.userId);
    res.redirect(`/admin/services?msg=${encodeURIComponent('Service deleted.')}`);
  } catch (err) {
    next(err);
  }
});
