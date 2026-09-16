/* ============================================================
   ADMIN DASHBOARD ROUTE
   ============================================================ */

import { Router } from 'express';
import * as Admin from '../../models/admin.js';
import { renderAdmin } from '../../lib/admin-render.js';

export const dashboardRouter = Router();

dashboardRouter.get('/', async (req, res, next) => {
  try {
    const stats = await Admin.getDashboardStats();
    renderAdmin(req, res, 'admin/dashboard', {
      title: 'Dashboard',
      breadcrumb: 'Overview',
      stats,
    });
  } catch (err) {
    next(err);
  }
});
