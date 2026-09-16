/* ============================================================
   ADMIN SUBMISSIONS ROUTE
   ============================================================ */

import { Router } from 'express';
import * as Admin from '../../models/admin.js';
import { renderAdmin } from '../../lib/admin-render.js';

export const submissionsRouter = Router();

submissionsRouter.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = 25;
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Admin.listSubmissions({ limit, offset }),
      Admin.countSubmissions(),
    ]);

    renderAdmin(req, res, 'admin/submissions/index', {
      title: 'Project Enquiries',
      breadcrumb: 'Enquiries',
      items,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    next(err);
  }
});

submissionsRouter.get('/:id', async (req, res, next) => {
  try {
    const sub = await Admin.getSubmissionById(req.params.id);
    if (!sub) return res.status(404).send('Submission not found');

    if (!sub.is_read) {
      await Admin.markSubmissionRead(sub.id, 1);
    }

    renderAdmin(req, res, 'admin/submissions/detail', {
      title: `Enquiry from ${sub.name}`,
      breadcrumb: `Enquiries / ${sub.name}`,
      sub,
    });
  } catch (err) {
    next(err);
  }
});

submissionsRouter.post('/:id/delete', async (req, res, next) => {
  try {
    await Admin.deleteSubmission(req.params.id, req.session.userId);
    res.redirect(`/admin/submissions?msg=${encodeURIComponent('Submission deleted.')}`);
  } catch (err) {
    next(err);
  }
});
