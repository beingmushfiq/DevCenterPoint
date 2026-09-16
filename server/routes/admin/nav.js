/* ============================================================
   ADMIN NAVIGATION MENU ROUTE
   ============================================================ */

import { Router } from 'express';
import * as Admin from '../../models/admin.js';
import { renderAdmin } from '../../lib/admin-render.js';

export const navRouter = Router();

navRouter.get('/', async (req, res, next) => {
  try {
    const items = await Admin.listAllNavItems();
    renderAdmin(req, res, 'admin/nav', {
      title: 'Navigation Menu',
      breadcrumb: 'Navigation',
      items,
    });
  } catch (err) {
    next(err);
  }
});

navRouter.post('/', async (req, res, next) => {
  try {
    const b = req.body;
    const items = [];
    if (Array.isArray(b.label)) {
      for (let i = 0; i < b.label.length; i++) {
        if (b.label[i] && b.url[i]) {
          items.push({
            location: b.location ? b.location[i] : 'primary',
            label: b.label[i],
            url: b.url[i],
            is_external: b.is_external ? b.is_external[i] === '1' : false,
            is_active: true,
          });
        }
      }
    }

    await Admin.saveNavItems(items, req.session.userId);
    res.redirect('/admin/nav?msg=Navigation updated successfully.');
  } catch (err) {
    next(err);
  }
});
