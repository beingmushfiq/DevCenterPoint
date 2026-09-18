/* ============================================================
   GLOBAL VIEW LOCALS

   Everything a template can rely on without a route passing it:
   site settings, navigation, the current path, and helpers.

   This runs on EVERY request, so it does one query for all
   settings rather than one per key, and caches navigation for a
   short window. A CMS that adds 12 queries to every page view is
   a CMS that makes the site slower than the hardcoded version it
   replaced.
   ============================================================ */

import { config } from '../config.js';
import { query } from '../db/pool.js';
import { renderMarkdown, markdownToText } from '../lib/markdown.js';
import { assetTags } from '../lib/assets.js';
import { absoluteUrl, cx, jsonLd, truncate } from '../lib/html.js';

/* Settings change rarely and are read constantly. A 5-second cache
   removes almost all of the query load while still reflecting an
   admin save within seconds — and the admin panel busts it
   explicitly on save, so the editor sees changes immediately. */
let settingsCache = { data: null, at: 0 };
let navCache = { data: null, at: 0 };
const TTL = 5000;

export function invalidateGlobals() {
  settingsCache = { data: null, at: 0 };
  navCache = { data: null, at: 0 };
}

async function loadSettings() {
  const now = Date.now();
  if (settingsCache.data && now - settingsCache.at < TTL) return settingsCache.data;

  const rows = await query('SELECT setting_key, setting_value, value_type FROM site_settings');
  const map = {};
  for (const r of rows) {
    let value = r.setting_value;
    if (r.value_type === 'json' && value) {
      /* A malformed JSON value must not take the whole site down.
         Fall back to the raw string and let the page render. */
      try { value = JSON.parse(value); } catch { /* keep raw */ }
    } else if (r.value_type === 'bool') {
      value = value === '1' || value === 'true';
    } else if (r.value_type === 'number') {
      value = Number(value);
    }
    map[r.setting_key] = value;
  }

  settingsCache = { data: map, at: now };
  return map;
}

async function loadNav() {
  const now = Date.now();
  if (navCache.data && now - navCache.at < TTL) return navCache.data;

  const rows = await query(
    `SELECT location, label, url, sort_order, is_external
       FROM nav_items
      WHERE is_active = 1
      ORDER BY location, sort_order, id`
  );
  const grouped = { primary: [], footer: [], legal: [] };
  for (const r of rows) (grouped[r.location] ||= []).push(r);

  navCache = { data: grouped, at: now };
  return grouped;
}

export async function globals(req, res, next) {
  try {
    const [settings, nav] = await Promise.all([loadSettings(), loadNav()]);

    res.locals.settings = settings;
    res.locals.nav = nav;
    res.locals.site = {
      name: settings['company.name'] || 'DevCenterPoint',
      tagline: settings['company.tagline'] || 'Code. Build. Deploy. Scale.',
      email: settings['company.email'] || 'hello@devcenterpoint.com',
      location: settings['company.location'] || '',
      defaultTitle: settings['seo.default_title'] || 'DevCenterPoint — Code. Build. Deploy. Scale.',
      defaultDescription: settings['seo.default_description'] || 'DevCenterPoint is an elite engineering consultancy. We code, build, deploy, and scale high-performance platforms, cloud architecture, and mission-critical software.',
      ogImage: settings['seo.og_image'] || '/brand/og-image.svg',
      social: {
        linkedin: settings['social.linkedin'] || 'https://www.linkedin.com/company/devcenterpoint',
        github: settings['social.github'] || 'https://github.com/DevCenterPoint',
        x: settings['social.x'] || '',
      },
    };

    res.locals.currentPath = req.path;

    /* ---- view helpers ---- */
    res.locals.asset = assetPath;
    res.locals.assetTags = assetTags;
    res.locals.formatDate = formatDate;
    res.locals.md = renderMarkdown;
    res.locals.mdText = markdownToText;
    res.locals.truncate = truncate;
    res.locals.cx = cx;
    res.locals.jsonLd = jsonLd;
    res.locals.query = req.query;
    res.locals.url = (p) => `${req.protocol}://${req.get('host')}${p}`;
    /* True when `path` is the current page or a parent of it — used
       by the nav to mark the active item. */
    res.locals.isActive = (path) =>
      path === '/' ? req.path === '/' : req.path === path || req.path.startsWith(`${path}/`);

    /* Per-page SEO defaults; a route overrides by setting them. */
    res.locals.seo = {
      title: res.locals.site.defaultTitle,
      description: res.locals.site.defaultDescription,
      image: res.locals.site.ogImage,
      type: 'website',
      canonical: canonicalFor(req),
      noindex: false,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/* Canonical URLs are built from SITE_URL, not the request host.
   The host varies between localhost, a preview deploy and
   production, and a canonical tag pointing at a preview domain is
   worse than none at all. Paginated and filtered views keep their
   query string, because they are genuinely different pages. */
function canonicalFor(req) {
  const keep = [];
  if (req.query.page) keep.push(`page=${encodeURIComponent(req.query.page)}`);
  if (req.query.sector) keep.push(`sector=${encodeURIComponent(req.query.sector)}`);
  if (req.query.tag) keep.push(`tag=${encodeURIComponent(req.query.tag)}`);
  const qs = keep.length ? `?${keep.join('&')}` : '';
  return absoluteUrl(config.siteUrl, `${req.path}${qs}`);
}

/* Absolute URL for a file in /public that is not hashed by Vite
   (uploads, favicons). Returns the path unchanged when it is
   already absolute, so a template can pass either. */
function assetPath(p) {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  return p.startsWith('/') ? p : `/${p}`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/* Dates come back from MySQL as 'YYYY-MM-DD' or a datetime string.
   Parsing with `new Date(str)` on a date-only string yields UTC
   midnight, which then renders as the previous day in any negative
   timezone — a classic off-by-one in blog archives. We format from
   the string parts instead, so the date shown is the date stored. */
export function formatDate(value, style = 'long') {
  if (!value) return '';
  const [datePart] = String(value).split(' ');
  const [y, m, d] = datePart.split('-').map(Number);
  if (!y || !m || !d) return String(value);

  if (style === 'iso') return datePart;

  const month = MONTHS[m - 1] || '';
  if (style === 'short') return `${d} ${month.slice(0, 3)} ${y}`;
  return `${d} ${month} ${y}`;
}
