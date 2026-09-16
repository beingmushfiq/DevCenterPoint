/* ============================================================
   ERROR HANDLING

   Two distinct responsibilities, often conflated:

     404 — the route does not exist. Render a real page.
     500 — the route exists and failed. Log it fully, tell the
           visitor nothing about internals.

   Stack traces are logged server-side and never rendered.
   ============================================================ */

export function notFound(req, res) {
  res.status(404);

  /* An API or fetch request wants JSON, not an HTML page. */
  const wantsJson = req.path.startsWith('/api/') ||
    (req.get('accept') || '').includes('application/json');
  if (wantsJson) {
    return res.json({ error: 'Not found', path: req.path });
  }

  res.locals.seo.title = 'Page not found — DevCenterPoint';
  res.locals.seo.noindex = true;
  return res.render('pages/404', { title: 'Page not found' });
}

/* Express identifies this as an error handler by its four
   parameters. Removing `next` — even though it looks unused —
   would silently convert it into ordinary middleware. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;

  /* 4xx from our own validation is expected traffic; 5xx is not
     and deserves the full stack. */
  if (status >= 500) {
    console.error(`\n  ✖ ${req.method} ${req.originalUrl}`);
    console.error(`    ${err.message}`);
    if (err.stack) console.error(err.stack.split('\n').slice(1, 6).join('\n'));
    console.error('');
  }

  if (res.headersSent) return res.end();

  const wantsJson = req.path.startsWith('/api/') ||
    (req.get('accept') || '').includes('application/json');
  if (wantsJson) {
    return res.status(status).json({
      error: status >= 500 ? 'Internal server error' : err.message,
    });
  }

  res.status(status);

  /* A database outage is the one failure worth naming, because the
     fix is almost always "start MySQL" and the generic 500 page
     would send the operator looking in the wrong place. */
  const isDbDown = ['ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ER_BAD_DB_ERROR']
    .includes(err.code);

  return res.render('pages/500', {
    title: 'Something went wrong',
    isDbDown,
    message: status < 500 ? err.message : null,
  });
}
