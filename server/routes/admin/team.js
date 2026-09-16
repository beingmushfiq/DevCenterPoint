/* ============================================================
   ADMIN TEAM ROUTE
   ============================================================ */

import { Router } from 'express';
import * as Admin from '../../models/admin.js';
import { renderAdmin } from '../../lib/admin-render.js';

export const teamRouter = Router();

teamRouter.get('/', async (req, res, next) => {
  try {
    const items = await Admin.listAllTeamMembers();
    renderAdmin(req, res, 'admin/team/index', {
      title: 'Team Members',
      breadcrumb: 'Team',
      items,
      topActions: '<a class="btn btn--primary" href="/admin/team/new">+ Add Member</a>',
    });
  } catch (err) {
    next(err);
  }
});

teamRouter.get('/new', async (req, res, next) => {
  try {
    const mediaList = await Admin.listMedia({ limit: 100 });
    renderAdmin(req, res, 'admin/team/edit', {
      title: 'Add Team Member',
      breadcrumb: 'Team / New',
      member: {
        id: null,
        name: '',
        role: '',
        bio: '',
        photo_media_id: null,
        location: '',
        email: '',
        sort_order: 0,
        status: 'active',
      },
      mediaList,
    });
  } catch (err) {
    next(err);
  }
});

teamRouter.post('/new', async (req, res, next) => {
  try {
    const b = req.body;
    const data = {
      name: b.name,
      role: b.role,
      bio: b.bio,
      photo_media_id: b.photo_media_id ? Number(b.photo_media_id) : null,
      location: b.location,
      email: b.email,
      sort_order: parseInt(b.sort_order, 10) || 0,
      status: b.status || 'active',
    };
    await Admin.saveTeamMember(null, data, req.session.userId);
    res.redirect(`/admin/team?msg=${encodeURIComponent('Team member added.')}`);
  } catch (err) {
    next(err);
  }
});

teamRouter.get('/:id/edit', async (req, res, next) => {
  try {
    const member = await Admin.getTeamMemberForEdit(req.params.id);
    if (!member) return res.status(404).send('Team member not found');
    const mediaList = await Admin.listMedia({ limit: 100 });

    renderAdmin(req, res, 'admin/team/edit', {
      title: `Edit: ${member.name}`,
      breadcrumb: `Team / ${member.name}`,
      member,
      mediaList,
    });
  } catch (err) {
    next(err);
  }
});

teamRouter.post('/:id/edit', async (req, res, next) => {
  try {
    const b = req.body;
    const data = {
      name: b.name,
      role: b.role,
      bio: b.bio,
      photo_media_id: b.photo_media_id ? Number(b.photo_media_id) : null,
      location: b.location,
      email: b.email,
      sort_order: parseInt(b.sort_order, 10) || 0,
      status: b.status || 'active',
    };
    await Admin.saveTeamMember(req.params.id, data, req.session.userId);
    res.redirect(`/admin/team?msg=${encodeURIComponent('Team member updated.')}`);
  } catch (err) {
    next(err);
  }
});

teamRouter.post('/:id/delete', async (req, res, next) => {
  try {
    await Admin.deleteTeamMember(req.params.id, req.session.userId);
    res.redirect(`/admin/team?msg=${encodeURIComponent('Team member removed.')}`);
  } catch (err) {
    next(err);
  }
});
