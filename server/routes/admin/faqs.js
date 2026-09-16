/* ============================================================
   ADMIN FAQS ROUTE
   ============================================================ */

import { Router } from 'express';
import * as Admin from '../../models/admin.js';
import { renderAdmin } from '../../lib/admin-render.js';

export const faqsRouter = Router();

faqsRouter.get('/', async (req, res, next) => {
  try {
    const items = await Admin.listAllAdminFaqs();
    renderAdmin(req, res, 'admin/faqs/index', {
      title: 'FAQs',
      breadcrumb: 'FAQs',
      items,
      topActions: '<a class="btn btn--primary" href="/admin/faqs/new">+ New FAQ</a>',
    });
  } catch (err) {
    next(err);
  }
});

faqsRouter.get('/new', (req, res) => {
  renderAdmin(req, res, 'admin/faqs/edit', {
    title: 'New FAQ',
    breadcrumb: 'FAQs / New',
    faq: {
      id: null,
      question: '',
      answer: '',
      category: 'General',
      sort_order: 0,
      status: 'active',
    },
  });
});

faqsRouter.post('/new', async (req, res, next) => {
  try {
    const b = req.body;
    const data = {
      question: b.question,
      answer: b.answer,
      category: b.category || 'General',
      sort_order: parseInt(b.sort_order, 10) || 0,
      status: b.status || 'active',
    };
    await Admin.saveFaq(null, data, req.session.userId);
    res.redirect(`/admin/faqs?msg=${encodeURIComponent('FAQ created.')}`);
  } catch (err) {
    next(err);
  }
});

faqsRouter.get('/:id/edit', async (req, res, next) => {
  try {
    const faq = await Admin.getFaqForEdit(req.params.id);
    if (!faq) return res.status(404).send('FAQ not found');

    renderAdmin(req, res, 'admin/faqs/edit', {
      title: 'Edit FAQ',
      breadcrumb: 'FAQs / Edit',
      faq,
    });
  } catch (err) {
    next(err);
  }
});

faqsRouter.post('/:id/edit', async (req, res, next) => {
  try {
    const b = req.body;
    const data = {
      question: b.question,
      answer: b.answer,
      category: b.category || 'General',
      sort_order: parseInt(b.sort_order, 10) || 0,
      status: b.status || 'active',
    };
    await Admin.saveFaq(req.params.id, data, req.session.userId);
    res.redirect(`/admin/faqs?msg=${encodeURIComponent('FAQ updated.')}`);
  } catch (err) {
    next(err);
  }
});

faqsRouter.post('/:id/delete', async (req, res, next) => {
  try {
    await Admin.deleteFaq(req.params.id, req.session.userId);
    res.redirect(`/admin/faqs?msg=${encodeURIComponent('FAQ deleted.')}`);
  } catch (err) {
    next(err);
  }
});
