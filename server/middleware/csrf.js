/* ============================================================
   CSRF PROTECTION MIDDLEWARE
   Session-backed token with double check on mutating methods.
   ============================================================ */

import crypto from 'node:crypto';

export function csrf(req, res, next) {
  if (!req.session) return next();

  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }

  res.locals.csrfToken = req.session.csrfToken;

  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  const token = req.body?._csrf || req.headers['x-csrf-token'];
  if (!token || token !== req.session.csrfToken) {
    res.status(403);
    const wantsJson = req.path.startsWith('/api/') || (req.get('accept') || '').includes('application/json');
    if (wantsJson) {
      return res.json({ error: 'Invalid or missing CSRF token' });
    }
    return res.render('pages/404', { title: 'Security token invalid' });
  }

  next();
}
