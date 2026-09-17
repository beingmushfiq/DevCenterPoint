/* ============================================================
   ASSET PIPELINE

   One interface, two implementations:

     dev  — Vite runs in middleware mode and compiles on demand.
            Tags point at source paths; HMR is live.
     prod — Vite has already built. Tags point at hashed files
            listed in the build manifest.

   Views never care which one is active. They call `assetTags()`
   and get back HTML.

   CSS is imported from JS (in the entry files) rather than linked
   from the EJS templates. That gives exactly one source of truth
   and avoids the classic MPA bug where a stylesheet is linked in
   the template but never bundled, because Vite only follows
   imports it can see.

   The cost is a flash of unstyled content in dev while the module
   graph loads. We pay it back with an inline critical-CSS block in
   the document head, which is worth doing anyway.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';

let mode = 'dev';
let viteServer = null;
let manifest = null;

/* Escape a value for safe interpolation into an HTML attribute.
   Asset paths come from our own build, but a manifest is a file on
   disk and files on disk get edited by hand. */
function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function initAssets(app) {
  /* In production (or when vite is not installed), load the build manifest. */
  const manifestPath = path.join(config.paths.dist, '.vite', 'manifest.json');

  if (config.isProd) {
    mode = 'prod';
    if (!fs.existsSync(manifestPath)) {
      console.warn('  ⚠️ Build manifest not found at dist/.vite/manifest.json');
      console.warn('    Serving without asset tags. Run `npm run build` to fix.');
      manifest = {};
    } else {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      console.log('  · Assets: production build manifest loaded');
    }
    return;
  }

  /* Dev mode — try to start Vite middleware. If vite is not installed
     (e.g. npm install --omit=dev was used), fall back to prod manifest. */
  mode = 'dev';
  try {
    const { createServer } = await import('vite');
    viteServer = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(viteServer.middlewares);
    console.log('  · Assets: Vite dev middleware attached (HMR active)');
  } catch (e) {
    /* vite not installed — switch to production manifest mode */
    mode = 'prod';
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      console.log('  · Assets: vite not installed, using production build manifest');
    } else {
      manifest = {};
      console.warn('  ⚠️ vite not installed and no build manifest found — assets may not load.');
    }
  }
}

/* Resolve an entry name to its emitted files. In production a
   single entry can produce a JS file plus imported CSS. */
function manifestEntry(name) {
  const entry = manifest?.[`src/entries/${name}.js`];
  if (!entry) return { js: null, css: [] };

  const css = new Set();
  const seen = new Set();

  /* CSS can hang off the entry itself or off any chunk it imports.
     We walk the graph rather than assuming it is all on the entry —
     that assumption holds until the first dynamic import and then
     silently drops styles. */
  const collect = (key) => {
    if (seen.has(key)) return;
    seen.add(key);
    const item = manifest[key];
    if (!item) return;
    (item.css || []).forEach((f) => css.add(f));
    (item.imports || []).forEach(collect);
  };
  collect(`src/entries/${name}.js`);

  return { js: entry.file, css: [...css] };
}

/* Dev-only stylesheet links, keyed by entry name.
   In production the manifest supplies the hashed CSS and these are
   not used. In dev, linking the sources directly paints the first
   frame styled instead of waiting for the module graph to execute —
   which is what removes the flash of unstyled content. The CSS is
   still imported by the entry as well; the duplication exists only
   in development and is what keeps HMR working. */
const DEV_CSS = {
  site: ['/src/styles/tokens.css', '/src/styles/base.css', '/src/styles/pages.css'],
  admin: ['/src/styles/admin.css'],
};

/* Returns { css, js } HTML strings for a named entry. */
export function assetTags(name) {
  if (mode === 'dev') {
    const links = (DEV_CSS[name] || [])
      .map((f) => `<link rel="stylesheet" href="${esc(f)}" />`)
      .join('\n  ');
    return {
      css: links,
      js:
        `<script type="module" src="/@vite/client"></script>\n  ` +
        `<script type="module" src="/src/entries/${esc(name)}.js"></script>`,
    };
  }

  const { js, css } = manifestEntry(name);
  const cssTags = css
    .map((f) => `<link rel="stylesheet" href="/${esc(f)}" />`)
    .join('\n  ');
  const jsTag = js
    ? `<script type="module" src="/${esc(js)}"></script>`
    : `<!-- entry "${esc(name)}" missing from build manifest -->`;

  return { css: cssTags, js: jsTag };
}

/* Vite middleware must be closed on shutdown, or the process hangs
   on Ctrl-C during development. */
export async function closeAssets() {
  if (viteServer) await viteServer.close();
}
