/* ============================================================
   ADMIN AUTH ROUTES
   ============================================================ */

import { Router } from 'express';
import bcryptjs from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import * as Admin from '../../models/admin.js';
import { requireGuest } from '../../middleware/auth.js';

export const authRouter = Router();

/* Protect admin login against automated credential stuffing and brute-force attacks.
   Only counts failed requests toward the limit. */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler(req, res) {
    res.status(429).render('admin/login', {
      error: 'Too many failed login attempts from this address. Please try again in 15 minutes.',
      email: String(req.body?.email || '').trim().toLowerCase(),
      next: req.body?.next || '/admin',
      layout: false,
    });
  },
});

authRouter.get('/login', requireGuest, (req, res) => {
  res.render('admin/login', {
    error: null,
    email: '',
    next: req.query.next || '/admin',
    layout: false,
  });
});

authRouter.post('/login', requireGuest, loginLimiter, async (req, res, next) => {
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

    if (user.failed_attempts >= 10) {
      return res.status(403).render('admin/login', {
        error: 'This account is temporarily locked due to excessive failed attempts. Please contact an administrator.',
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
