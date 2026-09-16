/* ============================================================
   ADMIN CASE STUDIES ROUTE
   ============================================================ */

import { Router } from 'express';
import * as Admin from '../../models/admin.js';
import * as Content from '../../models/content.js';
import { renderAdmin } from '../../lib/admin-render.js';

export const casesRouter = Router();

casesRouter.get('/', async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const sector = req.query.sector || '';
    const items = await Admin.listAllCaseStudies({ search, sector });
    const sectors = await Content.listSectors();

    renderAdmin(req, res, 'admin/cases/index', {
      title: 'Case Studies',
      breadcrumb: 'Case Studies',
      items,
      sectors,
      search,
      sector,
      topActions: '<a class="btn btn--primary" href="/admin/cases/new">+ New Case Study</a>',
    });
  } catch (err) {
    next(err);
  }
});

casesRouter.get('/new', async (req, res, next) => {
  try {
    const [services, mediaList] = await Promise.all([
      Content.listServices({ includeDrafts: true }),
      Admin.listMedia({ limit: 100 }),
    ]);

    renderAdmin(req, res, 'admin/cases/edit', {
      title: 'New Case Study',
      breadcrumb: 'Case Studies / New',
      cs: {
        id: null,
        slug: '',
        title: '',
        client_name: '',
        client_visibility: 'named',
        client_label: '',
        sector: 'Fintech',
        engagement: 'Full delivery',
        year: new Date().getFullYear(),
        duration: '3 months',
        team_size: '4 engineers',
        summary: '',
        challenge: '',
        approach: '',
        outcome: '',
        quote: '',
        quote_attribution: '',
        cover_media_id: null,
        cover_alt: '',
        is_featured: 0,
        sort_order: 0,
        status: 'draft',
        seo_title: '',
        seo_description: '',
        metrics: [],
        tech: [],
        serviceIds: [],
      },
      services,
      mediaList,
      errors: null,
    });
  } catch (err) {
    next(err);
  }
});

casesRouter.post('/new', async (req, res, next) => {
  try {
    const b = req.body;
    const metrics = [];
    if (Array.isArray(b.metric_label)) {
      for (let i = 0; i < b.metric_label.length; i++) {
        if (b.metric_label[i] && b.metric_value[i]) {
          metrics.push({
            label: b.metric_label[i],
            value: b.metric_value[i],
            unit: b.metric_unit ? b.metric_unit[i] : '',
            prefix: b.metric_prefix ? b.metric_prefix[i] : '',
            note: b.metric_note ? b.metric_note[i] : '',
          });
        }
      }
    }

    const tech = b.tech ? String(b.tech).split(',').map((t) => t.trim()).filter(Boolean) : [];
    const serviceIds = Array.isArray(b.service_ids) ? b.service_ids.map(Number) : (b.service_ids ? [Number(b.service_ids)] : []);

    const data = {
      slug: (b.slug || b.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: b.title,
      client_name: b.client_name,
      client_visibility: b.client_visibility,
      client_label: b.client_label,
      sector: b.sector,
      engagement: b.engagement,
      year: parseInt(b.year, 10) || new Date().getFullYear(),
      duration: b.duration,
      team_size: b.team_size,
      summary: b.summary,
      challenge: b.challenge,
      approach: b.approach,
      outcome: b.outcome,
      quote: b.quote,
      quote_attribution: b.quote_attribution,
      cover_media_id: b.cover_media_id ? Number(b.cover_media_id) : null,
      cover_alt: b.cover_alt,
      is_featured: b.is_featured === '1',
      sort_order: parseInt(b.sort_order, 10) || 0,
      status: b.status || 'draft',
      seo_title: b.seo_title,
      seo_description: b.seo_description,
      metrics,
      tech,
      serviceIds,
    };

    const id = await Admin.saveCaseStudy(null, data, req.session.userId);
    res.redirect(`/admin/cases?msg=${encodeURIComponent('Case study created successfully.')}`);
  } catch (err) {
    next(err);
  }
});

casesRouter.get('/:id/edit', async (req, res, next) => {
  try {
    const cs = await Admin.getCaseStudyForEdit(req.params.id);
    if (!cs) return res.status(404).send('Case study not found');

    const [services, mediaList] = await Promise.all([
      Content.listServices({ includeDrafts: true }),
      Admin.listMedia({ limit: 100 }),
    ]);

    renderAdmin(req, res, 'admin/cases/edit', {
      title: `Edit: ${cs.title}`,
      breadcrumb: `Case Studies / ${cs.title}`,
      cs,
      services,
      mediaList,
      errors: null,
    });
  } catch (err) {
    next(err);
  }
});

casesRouter.post('/:id/edit', async (req, res, next) => {
  try {
    const b = req.body;
    const metrics = [];
    if (Array.isArray(b.metric_label)) {
      for (let i = 0; i < b.metric_label.length; i++) {
        if (b.metric_label[i] && b.metric_value[i]) {
          metrics.push({
            label: b.metric_label[i],
            value: b.metric_value[i],
            unit: b.metric_unit ? b.metric_unit[i] : '',
            prefix: b.metric_prefix ? b.metric_prefix[i] : '',
            note: b.metric_note ? b.metric_note[i] : '',
          });
        }
      }
    }

    const tech = b.tech ? String(b.tech).split(',').map((t) => t.trim()).filter(Boolean) : [];
    const serviceIds = Array.isArray(b.service_ids) ? b.service_ids.map(Number) : (b.service_ids ? [Number(b.service_ids)] : []);

    const data = {
      slug: (b.slug || b.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: b.title,
      client_name: b.client_name,
      client_visibility: b.client_visibility,
      client_label: b.client_label,
      sector: b.sector,
      engagement: b.engagement,
      year: parseInt(b.year, 10) || new Date().getFullYear(),
      duration: b.duration,
      team_size: b.team_size,
      summary: b.summary,
      challenge: b.challenge,
      approach: b.approach,
      outcome: b.outcome,
      quote: b.quote,
      quote_attribution: b.quote_attribution,
      cover_media_id: b.cover_media_id ? Number(b.cover_media_id) : null,
      cover_alt: b.cover_alt,
      is_featured: b.is_featured === '1',
      sort_order: parseInt(b.sort_order, 10) || 0,
      status: b.status || 'draft',
      seo_title: b.seo_title,
      seo_description: b.seo_description,
      metrics,
      tech,
      serviceIds,
    };

    await Admin.saveCaseStudy(req.params.id, data, req.session.userId);
    res.redirect(`/admin/cases?msg=${encodeURIComponent('Case study saved successfully.')}`);
  } catch (err) {
    next(err);
  }
});

casesRouter.post('/:id/delete', async (req, res, next) => {
  try {
    await Admin.deleteCaseStudy(req.params.id, req.session.userId);
    res.redirect(`/admin/cases?msg=${encodeURIComponent('Case study deleted.')}`);
  } catch (err) {
    next(err);
  }
});
