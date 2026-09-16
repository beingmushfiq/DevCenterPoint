/* ============================================================
   ADMIN SITE SETTINGS ROUTE
   ============================================================ */

import { Router } from 'express';
import * as Admin from '../../models/admin.js';
import { renderAdmin } from '../../lib/admin-render.js';

export const settingsRouter = Router();

settingsRouter.get('/', async (req, res, next) => {
  try {
    const rawSettings = await Admin.getAllSettingsList();
    const settingsMap = {};
    for (const s of rawSettings) {
      settingsMap[s.setting_key] = s.setting_value;
    }

    renderAdmin(req, res, 'admin/settings', {
      title: 'Site Settings',
      breadcrumb: 'Settings',
      settingsMap,
    });
  } catch (err) {
    next(err);
  }
});

settingsRouter.post('/', async (req, res, next) => {
  try {
    const b = req.body;
    const settingsMap = {
      'company.name': b['company.name'],
      'company.tagline': b['company.tagline'],
      'company.email': b['company.email'],
      'company.phone': b['company.phone'],
      'company.location': b['company.location'],
      'seo.default_title': b['seo.default_title'],
      'seo.default_description': b['seo.default_description'],
      'social.linkedin': b['social.linkedin'],
      'social.github': b['social.github'],
      'social.x': b['social.x'],
      'footer.note': b['footer.note'],
    };

    await Admin.updateSettings(settingsMap, req.session.userId);
    res.redirect(`/admin/settings?msg=${encodeURIComponent('Site settings updated successfully.')}`);
  } catch (err) {
    next(err);
  }
});
