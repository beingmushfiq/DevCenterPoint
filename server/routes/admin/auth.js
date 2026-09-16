/* ============================================================
   ADMIN AUTH ROUTES
   ============================================================ */

import { Router } from 'express';
import bcryptjs from 'bcryptjs';
import * as Admin from '../../models/admin.js';
import { requireGuest } from '../../middleware/auth.js';

export const authRouter = Router();

authRouter.get('/login', requireGuest, (req, res) => {
  res.render('admin/login', {
    error: null,
    email: '',
    next: req.query.next || '/admin',
    layout: false,
  });
});

authRouter.post('/login', requireGuest, async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const nextUrl = req.body.next || '/admin';

    const user = await Admin.getUserByEmail(email);
    if (!user) {
      return res.status(401).render('admin/login', {
        error: 'Invalid credentials. Please check your email and password.',
        email,
        next: nextUrl,
        layout: false,
      });
    }

    const matches = bcryptjs.compareSync(password, user.password_hash);
    if (!matches) {
      await Admin.recordFailedLogin(user.id);
      return res.status(401).render('admin/login', {
        error: 'Invalid credentials. Please check your email and password.',
        email,
        next: nextUrl,
        layout: false,
      });
    }

    req.session.userId = user.id;
    req.session.userName = user.display_name;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;

    await Admin.updateUserLastLogin(user.id);
    await Admin.audit(user.id, 'login', 'user', user.id, 'Logged in to admin console');

    res.redirect(nextUrl.startsWith('/admin') ? nextUrl : '/admin');
  } catch (err) {
    next(err);
  }
});

authRouter.all('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect('/admin/login');
    });
  } else {
    res.redirect('/admin/login');
  }
});
