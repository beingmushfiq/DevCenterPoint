/* ============================================================
   ADMIN TESTIMONIALS ROUTE
   ============================================================ */

import { Router } from 'express';
import * as Admin from '../../models/admin.js';
import * as Content from '../../models/content.js';
import { renderAdmin } from '../../lib/admin-render.js';

export const testimonialsRouter = Router();

testimonialsRouter.get('/', async (req, res, next) => {
  try {
    const items = await Admin.listAllAdminTestimonials();
    renderAdmin(req, res, 'admin/testimonials/index', {
      title: 'Testimonials',
      breadcrumb: 'Testimonials',
      items,
      topActions: '<a class="btn btn--primary" href="/admin/testimonials/new">+ New Testimonial</a>',
    });
  } catch (err) {
    next(err);
  }
});

testimonialsRouter.get('/new', async (req, res, next) => {
  try {
    const caseStudies = await Content.listCaseStudies();
    renderAdmin(req, res, 'admin/testimonials/edit', {
      title: 'New Testimonial',
      breadcrumb: 'Testimonials / New',
      testimonial: {
        id: null,
        quote: '',
        attribution: '',
        role: '',
        company: '',
        case_study_id: null,
        sort_order: 0,
        status: 'active',
      },
      caseStudies,
    });
  } catch (err) {
    next(err);
  }
});

testimonialsRouter.post('/new', async (req, res, next) => {
  try {
    const b = req.body;
    const data = {
      quote: b.quote,
      attribution: b.attribution,
      role: b.role,
      company: b.company,
      case_study_id: b.case_study_id ? Number(b.case_study_id) : null,
      sort_order: parseInt(b.sort_order, 10) || 0,
      status: b.status || 'active',
    };
    await Admin.saveTestimonial(null, data, req.session.userId);
    res.redirect(`/admin/testimonials?msg=${encodeURIComponent('Testimonial created.')}`);
  } catch (err) {
    next(err);
  }
});

testimonialsRouter.get('/:id/edit', async (req, res, next) => {
  try {
    const testimonial = await Admin.getTestimonialForEdit(req.params.id);
    if (!testimonial) return res.status(404).send('Testimonial not found');
    const caseStudies = await Content.listCaseStudies();

    renderAdmin(req, res, 'admin/testimonials/edit', {
      title: `Edit: ${testimonial.attribution}`,
      breadcrumb: `Testimonials / ${testimonial.attribution}`,
      testimonial,
      caseStudies,
    });
  } catch (err) {
    next(err);
  }
});

testimonialsRouter.post('/:id/edit', async (req, res, next) => {
  try {
    const b = req.body;
    const data = {
      quote: b.quote,
      attribution: b.attribution,
      role: b.role,
      company: b.company,
      case_study_id: b.case_study_id ? Number(b.case_study_id) : null,
      sort_order: parseInt(b.sort_order, 10) || 0,
      status: b.status || 'active',
    };
    await Admin.saveTestimonial(req.params.id, data, req.session.userId);
    res.redirect(`/admin/testimonials?msg=${encodeURIComponent('Testimonial updated.')}`);
  } catch (err) {
    next(err);
  }
});

testimonialsRouter.post('/:id/delete', async (req, res, next) => {
  try {
    await Admin.deleteTestimonial(req.params.id, req.session.userId);
    res.redirect(`/admin/testimonials?msg=${encodeURIComponent('Testimonial deleted.')}`);
  } catch (err) {
    next(err);
  }
});
