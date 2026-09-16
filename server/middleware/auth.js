/* ============================================================
   ADMIN AUTH MIDDLEWARE
   ============================================================ */

export function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    res.locals.currentUser = {
      id: req.session.userId,
      name: req.session.userName,
      email: req.session.userEmail,
      role: req.session.userRole,
    };
    return next();
  }

  const wantsJson = req.path.startsWith('/api/') || (req.get('accept') || '').includes('application/json');
  if (wantsJson) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const nextUrl = encodeURIComponent(req.originalUrl || '/admin');
  return res.redirect(`/admin/login?next=${nextUrl}`);
}

export function requireGuest(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/admin');
  }
  next();
}
