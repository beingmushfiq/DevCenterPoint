/* ============================================================
   PUBLIC ROUTES

   Every page is server-rendered as a complete document. Slugs are
   the routing key for content, and a miss is a real 404 rather
   than a soft empty page.

   Route order matters: fixed paths (/work, /services) are declared
   before parameterised ones where ambiguity is possible, and the
   most specific slug routes come before the generic /:slug catch,
   which is declared last so it cannot shadow anything.
   ============================================================ */

import express from 'express';
import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';

import { config } from '../config.js';
import * as Content from '../models/content.js';
import { escapeHtml } from '../lib/html.js';

export const publicRoutes = express.Router();

/* Redirects handler from redirects table */
publicRoutes.use(async (req, res, next) => {
  try {
    const r = await Content.getRedirect(req.path);
    if (r) {
      return res.redirect(r.status_code || 301, r.to_path);
    }
    next();
  } catch (err) {
    next(err);
  }
});

/* ---------------------------------------------------------------
   CONTACT FORM
   --------------------------------------------------------------- */

/* Rate limited per IP. A marketing site's contact form is a
   favourite target for spam, and the cheapest defence is refusing
   to do work for the same address more than a few times an hour. */
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many enquiries from this address. Please try again later.',
});

/* The IP is hashed, never stored raw. Rate limiting only needs to
   tell addresses apart, not know them — so we keep the capability
   without holding the personal data. */
function hashIp(ip) {
  return crypto.createHash('sha256')
    .update(String(ip) + config.session.secret)
    .digest('hex');
}

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());

/* ---------------------------------------------------------------
   HOME
   --------------------------------------------------------------- */

publicRoutes.get('/', async (req, res, next) => {
  try {
    const sections = await Content.listHomeSections();

    /* The services chapter pulls live service rows rather than
       duplicating them into the section JSON — one source of truth,
       so renaming a discipline updates both the homepage and
       /services. */
    const servicesSection = sections.find((s) => s.section_key === 'what-we-do');
    const services = servicesSection
      ? await Content.listServices({ limit: servicesSection.content.limit || 6 })
      : [];

    const featured = await Content.listCaseStudies({ featuredOnly: true, limit: 3 });
    const testimonials = await Content.listTestimonials({ limit: 3 });

    res.locals.seo.title = res.locals.site.defaultTitle;
    res.locals.seo.description = res.locals.site.defaultDescription;

    res.render('pages/home', {
      pageType: 'home',
      sections,
      services,
      featured,
      testimonials,
      bodyClass: 'page-home',
    });
  } catch (err) { next(err); }
});

/* ---------------------------------------------------------------
   WORK  (case study index)
   --------------------------------------------------------------- */

const PER_PAGE = 9;

publicRoutes.get('/work', async (req, res, next) => {
  try {
    const sector = typeof req.query.sector === 'string' ? req.query.sector : null;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const offset = (page - 1) * PER_PAGE;

    const [items, total, sectors] = await Promise.all([
      Content.listCaseStudies({ sector, limit: PER_PAGE, offset }),
      Content.countCaseStudies({ sector }),
      Content.listSectors(),
    ]);

    const pages = Math.max(1, Math.ceil(total / PER_PAGE));

    /* A page number past the end is a 404, not a silently empty
       list — otherwise a stale link appears to work and shows
       nothing, which reads as a broken site. */
    if (page > pages && total > 0) {
      return next();
    }

    res.locals.seo.title = sector
      ? `${sector} case studies — DevCenterPoint`
      : 'Work — case studies from DevCenterPoint';
    res.locals.seo.description =
      'Projects we have delivered: what the problem was, what we did about it, and what changed as a result.';

    res.render('pages/work', {
      pageType: 'index',
      items, total, sectors, sector, page, pages,
      bodyClass: 'page-work',
    });
  } catch (err) { next(err); }
});

publicRoutes.get('/work/:slug', async (req, res, next) => {
  try {
    const cs = await Content.getCaseStudyBySlug(req.params.slug);
    if (!cs) return next();

    const [children, related, testimonials] = await Promise.all([
      Content.caseStudyChildren(cs.id),
      Content.relatedCaseStudies(cs.id, { limit: 3 }),
      Content.listTestimonials({ caseStudyId: cs.id }),
    ]);

    /* NDA'd clients must not leak through the page title either —
       the slug is public, but the client name is not. */
    const displayClient = cs.client_visibility === 'named'
      ? cs.client_name
      : (cs.client_label || 'A client');

    res.locals.seo.title = cs.seo_title || `${cs.title} — DevCenterPoint`;
    res.locals.seo.description = cs.seo_description || cs.summary;
    res.locals.seo.type = 'article';
    if (cs.cover_path) res.locals.seo.image = cs.cover_path;

    res.render('pages/case-study', {
      pageType: 'detail',
      cs, children, related, testimonials, displayClient,
      bodyClass: 'page-case-study',
    });
  } catch (err) { next(err); }
});

/* ---------------------------------------------------------------
   SERVICES
   --------------------------------------------------------------- */

publicRoutes.get('/services', async (req, res, next) => {
  try {
    const services = await Content.listServices();
    const deliverables = await Content.deliverablesFor(services.map((s) => s.id));
    const faqs = await Content.listFaqs();

    res.locals.seo.title = 'Services — engineering disciplines at DevCenterPoint';
    res.locals.seo.description =
      'Product engineering, architecture review, design sprints, platform modernisation, reliability and embedded partnership.';

    res.render('pages/services', {
      pageType: 'index',
      services, deliverables, faqs,
      bodyClass: 'page-services',
    });
  } catch (err) { next(err); }
});

publicRoutes.get('/services/:slug', async (req, res, next) => {
  try {
    const service = await Content.getServiceBySlug(req.params.slug);
    if (!service) return next();

    const [deliverables, related, all] = await Promise.all([
      Content.deliverablesFor([service.id]),
      Content.listCaseStudies({ serviceId: service.id, limit: 3 }),
      Content.listServices(),
    ]);

    res.locals.seo.title = service.seo_title || `${service.title} — DevCenterPoint`;
    res.locals.seo.description = service.seo_description || service.summary;

    res.render('pages/service', {
      pageType: 'index',
      service,
      deliverables: deliverables[service.id] || [],
      related,
      others: all.filter((s) => s.id !== service.id),
      bodyClass: 'page-service',
    });
  } catch (err) { next(err); }
});

/* ---------------------------------------------------------------
   INSIGHTS
   --------------------------------------------------------------- */

const POSTS_PER_PAGE = 9;

publicRoutes.get('/insights', async (req, res, next) => {
  try {
    const tagSlug = typeof req.query.tag === 'string' ? req.query.tag : null;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const offset = (page - 1) * POSTS_PER_PAGE;

    const [posts, total, tags] = await Promise.all([
      Content.listPosts({ tagSlug, limit: POSTS_PER_PAGE, offset }),
      Content.countPosts({ tagSlug }),
      Content.listTags(),
    ]);

    const pages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
    if (page > pages && total > 0) return next();

    res.locals.seo.title = tagSlug
      ? `Insights tagged “${tagSlug}” — DevCenterPoint`
      : 'Insights — DevCenterPoint';
    res.locals.seo.description =
      'Notes on engineering decisions, performance work and the cost of getting architecture wrong.';

    res.render('pages/insights', {
      pageType: 'index',
      posts, total, tags, tagSlug, page, pages,
      bodyClass: 'page-insights',
    });
  } catch (err) { next(err); }
});

publicRoutes.get('/insights/:slug', async (req, res, next) => {
  try {
    const post = await Content.getPostBySlug(req.params.slug);
    if (!post) return next();

    const related = await Content.listPosts({ limit: 3 });

    res.locals.seo.title = post.seo_title || `${post.title} — DevCenterPoint`;
    res.locals.seo.description = post.seo_description || post.excerpt || '';
    res.locals.seo.type = 'article';
    if (post.cover_path) res.locals.seo.image = post.cover_path;

    res.render('pages/post', {
      pageType: 'detail',
      post,
      related: related.filter((p) => p.id !== post.id).slice(0, 3),
      bodyClass: 'page-post',
    });
  } catch (err) { next(err); }
});

/* ---------------------------------------------------------------
   CONTACT
   --------------------------------------------------------------- */

publicRoutes.get('/contact', async (req, res, next) => {
  try {
    const types = res.locals.settings['contact.enquiry_types'] || [];
    const budgets = res.locals.settings['contact.budget_ranges'] || [];
    /* Pre-select from ?type=review so the CTAs on the homepage and
       engagement paths land on a form that is already half filled. */
    const selected = typeof req.query.type === 'string' ? req.query.type : '';
    const sent = req.query.sent === '1';

    res.locals.seo.title = 'Start a project — DevCenterPoint';
    res.locals.seo.description =
      'Tell us the problem. We reply within one business day with what it takes, what we would build first, and what we would refuse to build.';

    res.render('pages/contact', {
      pageType: 'detail',
      types,
      budgets,
      selected,
      sent,
      errors: null,
      values: {},
      bodyClass: 'page-contact',
    });
  } catch (err) { next(err); }
});

publicRoutes.post('/contact', contactLimiter, async (req, res, next) => {
  try {
    const b = req.body || {};
    const values = {
      name: String(b.name || '').trim().slice(0, 190),
      email: String(b.email || '').trim().slice(0, 190),
      company: String(b.company || '').trim().slice(0, 190),
      phone: String(b.phone || '').trim().slice(0, 60),
      enquiry_type: String(b.enquiry_type || 'other'),
      budget_range: String(b.budget_range || '').trim().slice(0, 60),
      message: String(b.message || '').trim().slice(0, 8000),
    };

    /* Honeypot. Bots fill hidden fields; humans do not. Treated as
       success so the bot does not learn it was caught and retry. */
    if (b.website) {
      return res.redirect('/contact?sent=1');
    }

    const errors = {};
    if (values.name.length < 2) errors.name = 'Please tell us your name.';
    if (!isValidEmail(values.email)) errors.email = 'That email address does not look right.';
    if (values.message.length < 20) {
      errors.message = 'A little more detail helps — 20 characters minimum.';
    }

    const allowedTypes = (res.locals.settings['contact.enquiry_types'] || [])
      .map((t) => t.value);
    if (!allowedTypes.includes(values.enquiry_type)) values.enquiry_type = 'other';

    if (Object.keys(errors).length > 0) {
      res.status(422);
      return res.render('pages/contact', {
        pageType: 'detail',
        types: res.locals.settings['contact.enquiry_types'] || [],
        budgets: res.locals.settings['contact.budget_ranges'] || [],
        selected: values.enquiry_type,
        sent: false,
        errors,
        values,
        bodyClass: 'page-contact',
      });
    }

    await Content.createSubmission({
      name: values.name,
      email: values.email,
      company: values.company,
      phone: values.phone,
      enquiryType: values.enquiry_type,
      budgetRange: values.budget_range,
      message: values.message,
      sourcePath: String(b.source_path || req.get('referer') || '').slice(0, 500),
      ipHash: hashIp(req.ip),
      userAgent: req.get('user-agent') || '',
    });

    res.redirect('/contact?sent=1');
  } catch (err) { next(err); }
});

/* ---------------------------------------------------------------
   ABOUT
   --------------------------------------------------------------- */

publicRoutes.get('/about', async (req, res, next) => {
  try {
    const [page, team, testimonials, faqs] = await Promise.all([
      Content.getPageBySlug('about'),
      Content.listTeam(),
      Content.listTestimonials({ limit: 3 }),
      Content.listFaqs(),
    ]);
    if (!page) return next();

    res.locals.seo.title = page.seo_title || `${page.title} — DevCenterPoint`;
    res.locals.seo.description = page.seo_description || page.lede || '';

    res.render('pages/about', {
      pageType: 'index',
      page, team, testimonials, faqs,
      bodyClass: 'page-about',
    });
  } catch (err) { next(err); }
});

/* ---------------------------------------------------------------
   SEO FEEDS & UTILITIES
   --------------------------------------------------------------- */

publicRoutes.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${config.siteUrl}/sitemap.xml
`);
});

publicRoutes.get('/sitemap.xml', async (req, res, next) => {
  try {
    const [cases, posts, services, pages] = await Promise.all([
      Content.listCaseStudies(),
      Content.listPosts(),
      Content.listServices(),
      Content.listPublishedPages(),
    ]);

    const urls = [
      { loc: '/', priority: '1.0', changefreq: 'weekly' },
      { loc: '/work', priority: '0.9', changefreq: 'weekly' },
      { loc: '/services', priority: '0.9', changefreq: 'monthly' },
      { loc: '/insights', priority: '0.8', changefreq: 'weekly' },
      { loc: '/about', priority: '0.7', changefreq: 'monthly' },
      { loc: '/contact', priority: '0.8', changefreq: 'monthly' },
    ];

    cases.forEach((c) => urls.push({ loc: `/work/${c.slug}`, priority: '0.8', changefreq: 'monthly' }));
    posts.forEach((p) => urls.push({ loc: `/insights/${p.slug}`, priority: '0.7', changefreq: 'monthly' }));
    services.forEach((s) => urls.push({ loc: `/services/${s.slug}`, priority: '0.8', changefreq: 'monthly' }));
    pages.forEach((p) => {
      if (p.slug !== 'about') urls.push({ loc: `/${p.slug}`, priority: '0.5', changefreq: 'yearly' });
    });

    res.type('application/xml');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${config.siteUrl}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    res.send(xml);
  } catch (err) { next(err); }
});

publicRoutes.get('/rss.xml', async (req, res, next) => {
  try {
    const posts = await Content.listPosts({ limit: 20 });
    res.type('application/rss+xml');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>DevCenterPoint Insights</title>
    <link>${config.siteUrl}/insights</link>
    <description>Engineering notes, architecture analysis, and lessons from production.</description>
    <language>en-gb</language>
    <atom:link href="${config.siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${posts.map((p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${config.siteUrl}/insights/${p.slug}</link>
      <guid>${config.siteUrl}/insights/${p.slug}</guid>
      <pubDate>${new Date(p.published_at || p.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${p.excerpt || ''}]]></description>
    </item>`).join('')}
  </channel>
</rss>`;
    res.send(xml);
  } catch (err) { next(err); }
});

/* ---------------------------------------------------------------
   LEGAL / GENERIC PAGES
   --------------------------------------------------------------- */

publicRoutes.get('/:slug', async (req, res, next) => {
  try {
    const page = await Content.getPageBySlug(req.params.slug);
    if (!page) return next();

    res.locals.seo.title = page.seo_title || `${page.title} — DevCenterPoint`;
    res.locals.seo.description = page.seo_description || page.lede || '';

    res.render('pages/page', {
      pageType: 'detail',
      page,
      bodyClass: `page-generic page-${page.slug}`,
    });
  } catch (err) { next(err); }
});

export { escapeHtml };
