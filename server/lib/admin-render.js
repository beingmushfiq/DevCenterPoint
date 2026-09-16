/* ============================================================
   ADMIN RENDER HELPER
   Wraps admin view templates inside views/admin/layout.ejs
   ============================================================ */

export function renderAdmin(req, res, view, data = {}) {
  const merged = { ...res.locals, ...data };
  res.render(view, merged, (err, html) => {
    if (err) {
      console.error('Error rendering admin view:', view, err);
      return req.next ? req.next(err) : res.status(500).send(err.message);
    }
    res.render('admin/layout', { ...merged, body: html });
  });
}
