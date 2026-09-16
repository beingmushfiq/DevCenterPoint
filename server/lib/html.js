/* ============================================================
   HTML HELPERS

   EJS escapes interpolated values by default (`<%= %>`), so the
   common XSS path is already closed. These helpers cover the
   cases where we must build an HTML string in JavaScript and hand
   it to EJS with `<%- %>`, or where a value lands outside an
   element's text content.

   Anything passed to `<%- %>` must go through one of these first.
   ============================================================ */

const ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

/* Builds a class attribute from a condition map, dropping falsy
   entries. Keeps templates free of ternary chains. */
export function cx(map) {
  return Object.entries(map || {})
    .filter(([, on]) => on)
    .map(([name]) => name)
    .join(' ');
}

/* Truncates on a word boundary so a card never shows half a word. */
export function truncate(value, length = 160) {
  const text = String(value || '').trim();
  if (text.length <= length) return text;
  const cut = text.slice(0, text.lastIndexOf(' ', length));
  return `${cut} …`;
}

/* Formats a byte count for the media library. */
export function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/* Absolute URL for canonical/OG tags, based on SITE_URL rather
   than the request host — the host varies between localhost, a
   preview deploy and production, and a canonical tag that points
   at a preview domain is worse than none. */
export function absoluteUrl(siteUrl, pathname = '/') {
  const base = String(siteUrl || '').replace(/\/+$/, '');
  const p = String(pathname || '/');
  return `${base}${p.startsWith('/') ? p : `/${p}`}`;
}

/* JSON-LD must be embedded in a <script> block, where `</script>`
   inside a string would end the block early. Escaping `<` is the
   standard defence. */
export function jsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
