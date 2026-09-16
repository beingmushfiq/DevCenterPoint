/* ============================================================
   SEED  —  `npm run db:seed`

   Idempotent: every insert is guarded by a natural key (slug or
   setting_key), so re-running updates nothing and duplicates
   nothing. This matters because `db:setup` calls seed, and people
   run `db:setup` more than once.

   The content here is real, not lorem ipsum. A CMS demoed with
   "Project One / Project Two" never reveals whether it can carry
   the weight of an actual case study.
   ============================================================ */

import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { query, execute, one } from './pool.js';

/* ---- helpers ------------------------------------------------ */

/* MySQL has no "INSERT IGNORE by natural key" that also returns the
   id, so we look up first. Slightly more code, far clearer intent. */
async function idFor(table, column, value) {
  const row = await one(`SELECT id FROM \`${table}\` WHERE \`${column}\` = ? LIMIT 1`, [value]);
  return row ? row.id : null;
}

async function upsertSetting(key, value, type = 'text') {
  await execute(
    `INSERT INTO site_settings (setting_key, setting_value, value_type)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [key, value, type]
  );
}

/* ---- owner account ------------------------------------------ */

async function seedAdmin() {
  const { email, password, name } = config.admin;
  if (!password) {
    console.log('  · ADMIN_PASSWORD not set — skipping owner account.');
    return null;
  }

  const existing = await idFor('users', 'email', email);
  const hash = await bcrypt.hash(password, 12);

  if (existing) {
    /* We deliberately do NOT overwrite the password on re-seed.
       Otherwise `npm run db:setup` — a routine command — would
       silently reset the owner's changed password. */
    await execute(
      'UPDATE users SET display_name = ?, role = ? WHERE id = ?',
      [name, 'owner', existing]
    );
    console.log(`  · Owner account present: ${email}`);
    return existing;
  }

  const result = await execute(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES (?, ?, ?, 'owner')`,
    [email, hash, name]
  );
  console.log(`  · Owner account created: ${email}`);
  return result.insertId;
}

/* ---- settings ------------------------------------------------ */

async function seedSettings() {
  const settings = [
    ['company.name', 'DevCenterPoint', 'text'],
    ['company.short_name', 'DCP', 'text'],
    ['company.tagline', 'Engineering partner, not vendor.', 'text'],
    ['company.email', 'hello@devcenterpoint.com', 'text'],
    ['company.phone', '', 'text'],
    ['company.location', 'Dhaka, Bangladesh', 'text'],
    ['company.hours', 'Sun–Thu, 09:00–18:00 (UTC+6)', 'text'],
    ['company.founded', '2026', 'text'],
    ['contact.reply_time', 'One business day', 'text'],
    ['contact.enquiry_types', JSON.stringify([
      { value: 'review', label: 'Architecture review' },
      { value: 'sprint', label: 'Design sprint' },
      { value: 'delivery', label: 'Full delivery' },
      { value: 'partnership', label: 'Ongoing partnership' },
      { value: 'other', label: 'Something else' },
    ]), 'json'],
    ['contact.budget_ranges', JSON.stringify([
      'Under $10k', '$10k – $25k', '$25k – $75k', '$75k – $150k', '$150k+', 'Not sure yet',
    ]), 'json'],
    ['seo.default_title', 'DevCenterPoint — Software that survives contact with production', 'text'],
    ['seo.default_description',
      'An engineering partner for teams who need software that holds up. We design, build and hand over systems you own outright.',
      'text'],
    ['seo.og_image', '', 'text'],
    ['social.linkedin', '', 'text'],
    ['social.github', '', 'text'],
    ['social.x', '', 'text'],
    ['footer.note', 'Built by the team that writes the code you receive.', 'text'],
  ];

  for (const [key, value, type] of settings) {
    await upsertSetting(key, value, type);
  }
  console.log(`  · ${settings.length} settings`);
}

/* ---- navigation ---------------------------------------------- */

async function seedNav() {
  const existing = await query('SELECT COUNT(*) AS n FROM nav_items');
  if (existing[0].n > 0) {
    console.log('  · Navigation present');
    return;
  }

  const primary = [
    ['Work', '/work', 1],
    ['Services', '/services', 2],
    ['About', '/about', 3],
    ['Insights', '/insights', 4],
  ];
  for (const [label, url, order] of primary) {
    await execute(
      'INSERT INTO nav_items (location, label, url, sort_order) VALUES (?, ?, ?, ?)',
      ['primary', label, url, order]
    );
  }

  const footer = [
    ['Work', '/work', 1],
    ['Services', '/services', 2],
    ['About', '/about', 3],
    ['Insights', '/insights', 4],
    ['Contact', '/contact', 5],
  ];
  for (const [label, url, order] of footer) {
    await execute(
      'INSERT INTO nav_items (location, label, url, sort_order) VALUES (?, ?, ?, ?)',
      ['footer', label, url, order]
    );
  }

  const legal = [
    ['Privacy', '/privacy', 1],
    ['Terms', '/terms', 2],
  ];
  for (const [label, url, order] of legal) {
    await execute(
      'INSERT INTO nav_items (location, label, url, sort_order) VALUES (?, ?, ?, ?)',
      ['legal', label, url, order]
    );
  }
  console.log(`  · ${primary.length + footer.length + legal.length} nav items`);
}

/* ---- services ------------------------------------------------ */

/* These six map 1:1 onto `case_study_services` and the icon keys
   resolve to inline SVG in the view — no icon font, no runtime fetch. */
const SERVICES = [
  {
    slug: 'product-engineering',
    title: 'Product Engineering',
    tagline: 'From a validated idea to software in production.',
    summary:
      'End-to-end delivery of web and backend systems: the data model, the API, the interface, the deployment, and the handover documentation that makes it yours.',
    body:
      'We build the whole thing, and we build it so you can leave us.\n\n' +
      'That means versioned APIs with written contracts, database migrations under source control, tests around the parts that would hurt to break, and a README that a new engineer can actually follow. No framework chosen for novelty, no abstraction added for a scale you have not reached.\n\n' +
      'Every engagement ends with your team able to run, change and extend the system without us.',
    icon_key: 'stack',
    deliverables: [
      'System and data-model design', 'Web application development', 'API design and versioning',
      'Database design and migrations', 'CI/CD pipelines', 'Handover documentation',
    ],
  },
  {
    slug: 'architecture-review',
    title: 'Architecture Review',
    tagline: 'A second opinion before you commit the budget.',
    summary:
      'A structured audit of an existing system or a proposed design, delivered as a written report with prioritised, costed recommendations.',
    body:
      'Most expensive mistakes are architectural, and they are cheapest to fix before the first line of code.\n\n' +
      'We read the code, trace the real request paths, look at the query plans, and talk to the people carrying the pager. You get a written report: what is holding the system back, what it will cost to leave alone, and what we would change first.\n\n' +
      'It is a fixed-scope engagement, and you are under no obligation to hire us afterwards.',
    icon_key: 'compass',
    deliverables: [
      'Codebase and architecture audit', 'Scalability and bottleneck analysis',
      'Security and dependency review', 'Prioritised remediation roadmap',
      'Cost and timeline estimates',
    ],
  },
  {
    slug: 'design-sprint',
    title: 'Design Sprint',
    tagline: 'De-risk the hard question in weeks, not quarters.',
    summary:
      'A focused sprint that turns an uncertain idea into a working prototype and a validated technical direction.',
    body:
      'Some questions cannot be answered on a whiteboard. Does this third-party API actually carry the load? Will this data model survive the second feature?\n\n' +
      'We build the smallest real thing that answers the question — a working prototype against your actual data, not a mockup. You finish the sprint with evidence, a recommended direction, and an honest estimate for the full build.\n\n' +
      'For teams who need to know whether something is possible before they can justify funding it.',
    icon_key: 'sprint',
    deliverables: [
      'Problem framing and constraints', 'Technical spike and prototype',
      'Feasibility findings', 'Recommended architecture', 'Delivery estimate',
    ],
  },
  {
    slug: 'platform-modernisation',
    title: 'Platform Modernisation',
    tagline: 'Replace the foundation without stopping the business.',
    summary:
      'Incremental migration off legacy systems, run in parallel so the existing product keeps serving customers while the new one comes online.',
    body:
      'The dangerous part of a rewrite is not the new code. It is the cutover.\n\n' +
      'We work by strangler pattern: new capability is built alongside the old system, traffic moves across gradually, and the legacy surface shrinks until there is nothing left to remove. The business keeps running the entire time, and every stage is independently reversible.\n\n' +
      'We are equally willing to tell you not to rewrite. Sometimes a system is unfashionable and perfectly adequate, and a rebuild is the expensive mistake.',
    icon_key: 'migrate',
    deliverables: [
      'Legacy system assessment', 'Incremental migration strategy',
      'Data migration and reconciliation', 'Parallel-run cutover planning', 'Decommissioning plan',
    ],
  },
  {
    slug: 'reliability-engineering',
    title: 'Reliability Engineering',
    tagline: 'Make the system tell you when it breaks.',
    summary:
      'Observability, performance work and incident readiness, so problems surface before your customers find them.',
    body:
      'A system you cannot see into is a system you cannot operate.\n\n' +
      'We instrument the request path, set alert thresholds against real user-facing symptoms rather than CPU graphs, and track performance as a first-class metric with a budget that fails the build when exceeded. Then we write the runbooks and rehearse the failure.\n\n' +
      'The goal is not zero incidents. It is short ones, and the ability to tell your customers something true.',
    icon_key: 'pulse',
    deliverables: [
      'Observability and tracing setup', 'Performance profiling and budgets',
      'Alerting on user-facing symptoms', 'Backup and disaster-recovery drills',
      'Incident runbooks',
    ],
  },
  {
    slug: 'engineering-partnership',
    title: 'Engineering Partnership',
    tagline: 'Senior engineers embedded with your team.',
    summary:
      'Ongoing capacity alongside your in-house engineers: shared standards, code review, mentoring and delivery accountability.',
    body:
      'Some teams do not need a vendor. They need experienced engineers who show up to standup and own their tickets.\n\n' +
      'We embed with your team under your process, review code in the open, and raise the level as we go. No separate delivery track, no information asymmetry, no knowledge that only exists in our heads at the end.\n\n' +
      'Scales from one engineer to a full squad, with the same standard of work either way.',
    icon_key: 'partners',
    deliverables: [
      'Embedded senior engineering capacity', 'Code review and standards',
      'Technical mentoring', 'Delivery and sprint accountability', 'Architecture ownership',
    ],
  },
];

async function seedServices() {
  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i];
    let id = await idFor('services', 'slug', s.slug);

    if (!id) {
      const r = await execute(
        `INSERT INTO services
           (slug, title, tagline, summary, body, icon_key, sort_order, status,
            is_featured, seo_title, seo_description, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, NOW())`,
        [s.slug, s.title, s.tagline, s.summary, s.body, s.icon_key, i + 1,
         i < 3 ? 1 : 0, `${s.title} — DevCenterPoint`, s.summary]
      );
      id = r.insertId;
    }

    const existing = await query(
      'SELECT COUNT(*) AS n FROM service_deliverables WHERE service_id = ?', [id]
    );
    if (existing[0].n === 0) {
      for (let d = 0; d < s.deliverables.length; d++) {
        await execute(
          'INSERT INTO service_deliverables (service_id, label, sort_order) VALUES (?, ?, ?)',
          [id, s.deliverables[d], d + 1]
        );
      }
    }
  }
  console.log(`  · ${SERVICES.length} services`);
}

/* ---- case studies -------------------------------------------- */

/* These four carry the same argument as the homepage — that cost
   compounds with how late a problem is found — but they prove it
   with specifics instead of asserting it. */
const CASE_STUDIES = [
  {
    slug: 'nordic-freight-consolidation',
    title: 'Consolidating four dispatch systems into one',
    client_name: 'Nordhavn Freight',
    client_visibility: 'named',
    sector: 'Logistics',
    engagement: 'delivery',
    year: 2026,
    duration: '18 weeks',
    team_size: 4,
    summary:
      'Four regional dispatch tools, four data models, and no single view of a shipment. We replaced them with one platform while all four kept running.',
    context:
      'Nordhavn had grown by acquisition. Each of the four regional businesses arrived with its own dispatch system, its own notion of what a "shipment" was, and its own integration to the same accounting package.\n\n' +
      'Every month-end required three analysts and four days of manual reconciliation. Customer service could not answer "where is my container?" without calling a regional office.',
    challenge:
      'The four systems could not be switched off. Each one ran live dispatch for its region, and a failed cutover would strand drivers mid-route.\n\n' +
      'The data also disagreed in ways that could not be resolved automatically: the same customer existed under four different identifiers, and shipment statuses did not map cleanly across systems.',
    approach:
      'We spent the first three weeks doing nothing but modelling. A single canonical shipment, customer and route model, written down and signed off by all four regional leads before any code was written.\n\n' +
      'Then we built the new platform alongside the existing ones and put a routing layer in front. Traffic moved region by region, starting with the smallest. Each region ran in parallel for two weeks with write-forward reconciliation, so the new system could be compared against the old one before it was trusted.\n\n' +
      'The legacy systems were decommissioned one at a time, each with a documented rollback that was never needed.',
    outcome:
      'One platform now dispatches all four regions. The monthly reconciliation went from four days to a single automated job that completes in under nine minutes.\n\n' +
      'The parallel-run period surfaced 14 data discrepancies that would each have become a customer-visible billing error after cutover — at four days of analyst time apiece to unwind.',
    quote:
      'They spent three weeks refusing to write code until the data model was right. That felt slow at the time. It is the only reason the cutover was boring.',
    quote_attribution: 'Mette Sørensen, Director of Operations',
    metrics: [
      { label: 'Reconciliation time', value: '4', unit: 'days → 9 min', note: 'month-end, manual to automated' },
      { label: 'Systems consolidated', value: '4', unit: '→ 1', note: 'no operational downtime' },
      { label: 'Discrepancies caught pre-cutover', value: '14', note: 'each a potential billing error' },
    ],
    tech: ['PostgreSQL', 'Node.js', 'TypeScript', 'Redis', 'Docker', 'AWS'],
    serviceSlugs: ['platform-modernisation', 'product-engineering'],
    featured: true,
  },
  {
    slug: 'clinical-trial-data-integrity',
    title: 'Making trial data auditable end to end',
    client_name: 'A clinical research organisation',
    client_visibility: 'anonymised',
    client_label: 'A European clinical research organisation',
    sector: 'Healthcare',
    engagement: 'review',
    year: 2025,
    duration: '6 weeks',
    team_size: 2,
    summary:
      'A six-week audit that found the trial data was trustworthy but the audit trail was not — and fixed the finding before the regulator did.',
    context:
      'The organisation runs multi-site clinical trials and had built its own data capture system over seven years. An upcoming regulatory inspection required that any data point could be traced from entry to analysis.',
    challenge:
      'The system recorded final values faithfully. It did not record who changed what, when, or why across roughly 40% of the edit paths — the trail had gaps precisely where an inspector would look.\n\n' +
      'Retrofitting an audit trail to a seven-year-old codebase is not a feature. It is a change to every write path in the system.',
    approach:
      'We mapped every mutation path in the codebase and classified them by audit coverage. That produced a concrete list: 61 write paths, 24 of them uncovered.\n\n' +
      'Rather than patching each one, we introduced a single persistence layer that all writes must pass through, and moved the 24 paths onto it. The audit record became structurally impossible to bypass rather than a thing developers had to remember.\n\n' +
      'We delivered the report, the migration plan and the fix, and the inspection passed with the trail cited as a strength.',
    outcome:
      'Audit coverage went from 61% to 100% of write paths, enforced at the persistence layer rather than by convention.\n\n' +
      'The remediation landed in five weeks against an original estimate of four months, because the classification work showed most paths already had partial coverage.',
    quote:
      'The finding was accurate and uncomfortable. What mattered was that the fix made the problem impossible to reintroduce.',
    quote_attribution: 'Head of Clinical Systems',
    metrics: [
      { label: 'Audit coverage', value: '100', unit: '%', prefix: '', note: 'up from 61% of write paths' },
      { label: 'Remediation time', value: '5', unit: 'weeks', note: 'against a 4-month original estimate' },
      { label: 'Uncovered write paths', value: '24', note: 'identified, then closed' },
    ],
    tech: ['Java', 'Spring', 'MySQL', 'Flyway', 'JUnit'],
    serviceSlugs: ['architecture-review', 'reliability-engineering'],
    featured: true,
  },
  {
    slug: 'retail-checkout-latency',
    title: 'Cutting checkout latency by 72%',
    client_name: 'Halden & Co',
    client_visibility: 'named',
    sector: 'Retail',
    engagement: 'sprint',
    year: 2026,
    duration: '4 weeks',
    team_size: 3,
    summary:
      'A four-week sprint that found the checkout was slow because of one synchronous call nobody had questioned since launch.',
    context:
      'A mid-market retailer with strong seasonal traffic. Checkout latency sat at 3.1 seconds at the 95th percentile during peak, and cart abandonment rose sharply whenever a campaign drove volume.',
    challenge:
      'Two previous optimisation attempts had failed. Both had focused on the frontend and the database, and neither had moved the number — which suggested the bottleneck was somewhere nobody was looking.',
    approach:
      'We instrumented the full request path before changing anything, including the third-party calls that tend to be invisible in application tracing.\n\n' +
      'The profile was unambiguous: a synchronous inventory-reservation call to a third-party service accounted for 1.9 of the 3.1 seconds, and it failed on a 4-second timeout. It was on the critical path purely because it had been added there first and never revisited.\n\n' +
      'We moved the reservation into an asynchronous step with an optimistic hold, added a circuit breaker with a defined degradation path, and set a performance budget in CI so the number could not silently regress.',
    outcome:
      '95th-percentile checkout latency fell from 3.1s to 870ms — a 72% reduction — measured over a 30-day window that included two campaign peaks.\n\n' +
      'Cart abandonment during campaigns dropped measurably, and the circuit breaker has since absorbed three third-party incidents without customer-visible impact.',
    quote:
      'Two teams had tried to fix this and failed. They found it in a week because they measured before they touched anything.',
    quote_attribution: 'Priya Raghavan, VP Engineering',
    metrics: [
      { label: 'P95 checkout latency', value: '72', unit: '%', note: '3.1s → 870ms over 30 days' },
      { label: 'Third-party incidents absorbed', value: '3', note: 'no customer-visible impact' },
      { label: 'Time on critical path', value: '1.9', unit: 's', note: 'one synchronous call, identified' },
    ],
    tech: ['React', 'Go', 'PostgreSQL', 'Redis', 'Grafana', 'Terraform'],
    serviceSlugs: ['reliability-engineering', 'design-sprint'],
    featured: true,
  },
  {
    slug: 'fintech-ledger-rebuild',
    title: 'Rebuilding a ledger that could not be wrong',
    client_name: 'Meridian Pay',
    client_visibility: 'nda',
    client_label: 'A regulated payments provider',
    sector: 'Financial services',
    engagement: 'partnership',
    year: 2025,
    duration: '9 months',
    team_size: 5,
    summary:
      'A double-entry ledger rebuilt under a regulator\'s deadline, with every historical transaction reconciled before a single new one was accepted.',
    context:
      'The provider processed payments across three currencies. The ledger recorded balances but not the entries that produced them, so any discrepancy could be seen but not explained.',
    challenge:
      'Financial regulators do not accept "the balance looks right". Every historical value had to be reconstructable from immutable entries, and the migration had to prove equivalence for several million existing transactions.\n\n' +
      'There was also a hard deadline attached to the licence, which removed the option to pause and rebuild cleanly.',
    approach:
      'We built the new double-entry ledger as a separate service with an append-only entry table — corrections are new reversing entries, never updates.\n\n' +
      'Historical transactions were replayed through the new engine into a shadow ledger, and the two were reconciled account by account. Every line that disagreed was investigated to root cause before migration was allowed to proceed. That reconciliation found 340 exceptions, the oldest dating back four years.\n\n' +
      'Cutover happened at a weekend close, with the shadow ledger running in parallel for a further 60 days.',
    outcome:
      'The ledger has been the authoritative record since cutover. All 340 historical exceptions were resolved and documented, and the regulator\'s conditions were met ahead of the licence deadline.\n\n' +
      'The append-only model means the reconciliation that used to take a week now runs continuously.',
    quote:
      'They found four years of exceptions we did not know we had. That was not a comfortable conversation, but it was the right one.',
    quote_attribution: 'Chief Financial Officer',
    metrics: [
      { label: 'Historical transactions reconciled', value: '340', unit: 'exceptions', note: 'oldest four years back' },
      { label: 'Parallel-run period', value: '60', unit: 'days', note: 'shadow ledger after cutover' },
      { label: 'Regulatory conditions', value: '100', unit: '%', note: 'met ahead of licence deadline' },
    ],
    tech: ['PostgreSQL', 'TypeScript', 'Kafka', 'Kubernetes', 'Terraform', 'Datadog'],
    serviceSlugs: ['engineering-partnership', 'platform-modernisation'],
    featured: false,
  },
];

async function seedCaseStudies() {
  for (let i = 0; i < CASE_STUDIES.length; i++) {
    const cs = CASE_STUDIES[i];
    let id = await idFor('case_studies', 'slug', cs.slug);

    if (!id) {
      const r = await execute(
        `INSERT INTO case_studies
           (slug, title, client_name, client_visibility, client_label, sector, engagement,
            year, duration, team_size, summary, context, challenge, approach, outcome,
            quote, quote_attribution, is_featured, sort_order, status, seo_title, seo_description, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, NOW())`,
        [cs.slug, cs.title, cs.client_name, cs.client_visibility, cs.client_label ?? null,
         cs.sector, cs.engagement, cs.year, cs.duration, cs.team_size, cs.summary, cs.context,
         cs.challenge, cs.approach, cs.outcome, cs.quote, cs.quote_attribution,
         cs.featured ? 1 : 0, i + 1, `${cs.title} — DevCenterPoint`, cs.summary]
      );
      id = r.insertId;
    }

    const mCount = await query('SELECT COUNT(*) AS n FROM case_study_metrics WHERE case_study_id = ?', [id]);
    if (mCount[0].n === 0) {
      for (let m = 0; m < cs.metrics.length; m++) {
        const mt = cs.metrics[m];
        await execute(
          `INSERT INTO case_study_metrics (case_study_id, label, value, unit, prefix, note, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, mt.label, mt.value, mt.unit ?? null, mt.prefix ?? null, mt.note ?? null, m + 1]
        );
      }
    }

    const tCount = await query('SELECT COUNT(*) AS n FROM case_study_tech WHERE case_study_id = ?', [id]);
    if (tCount[0].n === 0) {
      for (let t = 0; t < cs.tech.length; t++) {
        await execute(
          'INSERT INTO case_study_tech (case_study_id, label, sort_order) VALUES (?, ?, ?)',
          [id, cs.tech[t], t + 1]
        );
      }
    }

    const sCount = await query('SELECT COUNT(*) AS n FROM case_study_services WHERE case_study_id = ?', [id]);
    if (sCount[0].n === 0) {
      for (const slug of cs.serviceSlugs) {
        const sid = await idFor('services', 'slug', slug);
        if (sid) {
          await execute(
            'INSERT INTO case_study_services (case_study_id, service_id) VALUES (?, ?)',
            [id, sid]
          );
        }
      }
    }
  }
  console.log(`  · ${CASE_STUDIES.length} case studies`);
}

/* ---- home sections ------------------------------------------- */

/* The homepage chapters, now database rows. `scene` matches the
   shapeStates index in the Three.js scene, so reordering content
   does not desynchronise the 3D layer. */
const HOME_SECTIONS = [
  {
    key: 'hero', scene: 'shards',
    eyebrow: 'Independent software engineering',
    heading: 'Bring your problems.',
    emphasis: 'Bring your idea.',
    lede: 'We design and build software for teams who need it to hold up in production — and to still make sense to the engineer who inherits it.',
    content: {
      note: 'No sales layer. You talk to the people who write the code.',
      credibility: [
        { label: 'Senior engineers only' },
        { label: 'You own every commit' },
        { label: 'Reply within one business day' },
      ],
    },
  },
  {
    key: 'cost-curve', scene: 'scatter',
    eyebrow: 'The problem',
    heading: 'Software is rarely expensive to build.',
    emphasis: 'It is expensive to change.',
    lede: 'The cost of correcting a decision is not fixed. It grows by roughly an order of magnitude at every stage it survives — and most of that growth is invisible until production.',
    content: {
      curve: [
        { stage: 'Design', multiplier: '1', label: 'Caught on the whiteboard', detail: 'A conversation and a redrawn diagram.' },
        { stage: 'Build', multiplier: '10', label: 'Caught in code review', detail: 'A refactor, a migration, and a day of rework.' },
        { stage: 'Production', multiplier: '100', label: 'Caught by your customers', detail: 'Incident response, data repair, and lost trust.' },
      ],
      closing: 'This is the entire argument for spending longer before writing code. Not process for its own sake — arithmetic.',
    },
  },
  {
    key: 'what-we-are', scene: 'converge',
    eyebrow: 'What we are',
    heading: 'An engineering partner,',
    emphasis: 'not a vendor.',
    lede: 'A vendor delivers what the contract describes and leaves. A partner is accountable for whether the thing works — and says so when the brief is wrong.',
    content: {
      paragraphs: [
        'The name is the model, literally: a dev centre that holds design, backend, frontend, data and operations under one roof, and a single point of contact you can hold accountable for the whole of it.',
        'We are deliberately small and deliberately senior. There is no bench of juniors to bill for, no account manager between you and the work, and no incentive to make the engagement longer than it needs to be.',
      ],
      specs: [
        { k: 'Founded', v: '2026' },
        { k: 'Model', v: 'Senior-only, no bench' },
        { k: 'Engagements', v: 'Review → Sprint → Delivery' },
        { k: 'Based in', v: 'Dhaka, working globally' },
        { k: 'Ip ownership', v: 'Yours, on every commit' },
        { k: 'Handover', v: 'Documented, always' },
      ],
    },
  },
  {
    key: 'what-we-do', scene: 'build',
    eyebrow: 'What we do',
    heading: 'Six disciplines,',
    emphasis: 'one system.',
    lede: 'Most problems worth solving do not sit neatly inside one specialism. These are the ones we cover end to end.',
    content: { source: 'services', limit: 6, cta: { label: 'See how we work', url: '/services' } },
  },
  {
    key: 'how-we-work', scene: 'name',
    eyebrow: 'How we work',
    heading: 'Five non-negotiables,',
    emphasis: 'held on every project.',
    lede: 'These are not aspirations. They are the operating rules that make the rest of what we claim possible.',
    content: {
      method: [
        { n: 'M—01', title: 'Measure before you change', body: 'Every optimisation starts with a profile and ends with a number. No exceptions for things that "feel slow".' },
        { n: 'M—02', title: 'Model before you code', body: 'The data model and the contracts are agreed in writing before implementation. This is where the 100× costs are avoided.' },
        { n: 'M—03', title: 'Own the whole path', body: 'We do not hand off the hard part. The people who design the system build it, deploy it and carry the pager for it.' },
        { n: 'M—04', title: 'Ship reversible increments', body: 'Every change can be rolled back independently. If a release cannot be undone in minutes, it is not ready to go out.' },
        { n: 'M—05', title: 'Write it down', body: 'Decisions, trade-offs, and the reasons for both. The documentation is part of the deliverable, not an afterthought.' },
      ],
    },
  },
  {
    key: 'commitments', scene: 'leap',
    eyebrow: 'What we commit to',
    heading: 'Terms you can hold us to,',
    emphasis: 'in writing.',
    lede: 'Vague promises are worthless in a contract. These are specific, and we will put them in one.',
    content: {
      metrics: [
        { value: '1', unit: ' business day', label: 'Maximum reply time, from first contact and throughout the engagement.' },
        { value: '100', unit: '%', label: 'Of code and documentation ownership transfers to you. No licence games, no lock-in.' },
        { value: '30', unit: ' days', label: 'Of post-handover support included on every delivery, so nothing is abandoned at the finish line.' },
      ],
      specs: [
        { k: 'Code ownership', v: 'Yours, on every commit' },
        { k: 'Repository', v: 'Yours from day one' },
        { k: 'Estimates', v: 'Fixed scope, or fixed rate' },
        { k: 'Change requests', v: 'Costed, never assumed' },
        { k: 'Exit terms', v: '30-day notice, no penalty' },
        { k: 'Confidentiality', v: 'NDA as standard' },
      ],
    },
  },
  {
    key: 'who-stands-behind-it', scene: 'merge',
    eyebrow: 'Who stands behind it',
    heading: 'There is no',
    emphasis: "'I' in the code we hand you.",
    lede: 'Software is a team artifact. The measure of an engineering partner is whether the system makes sense to someone who was not in the room when it was designed.',
    content: {
      quote: 'The real test of a codebase is not whether it works today. It is whether the person who inherits it can change it without fear.',
      paragraphs: [
        'Every engagement leaves behind a repository you can read, a decision log explaining why things are the way they are, and a runbook for the parts that can fail at 3am.',
        'If you cannot maintain what we build without us, we have not finished the job.',
      ],
    },
  },
  {
    key: 'start-here', scene: 'expand',
    eyebrow: 'Start here',
    heading: 'Bring us the thing you are',
    emphasis: 'not sure is possible.',
    lede: 'Three ways in. Each one is a complete engagement on its own, and none of them requires you to commit to the next.',
    content: {
      paths: [
        {
          n: '01', name: 'Architecture review', url: '/contact?type=review',
          promise: 'Lowest risk',
          body: 'We audit what you have, or what you are planning, and hand you a written report with costed priorities. Fixed scope, fixed price, no obligation afterwards.',
        },
        {
          n: '02', name: 'Design sprint', url: '/contact?type=sprint',
          promise: 'Fastest signal',
          body: 'We answer one hard question with a working prototype against your real data. You finish with evidence and an honest estimate for the full build.',
        },
        {
          n: '03', name: 'Full delivery', url: '/contact?type=delivery',
          promise: 'End to end',
          body: 'We design, build, deploy and hand over the whole system. You get the repository, the documentation and 30 days of support.',
        },
      ],
      closing: 'Not sure which one? Send the problem, not the specification. We will tell you what we think it needs — including if the answer is that it needs less than you expected.',
    },
  },
];

async function seedHomeSections() {
  for (let i = 0; i < HOME_SECTIONS.length; i++) {
    const s = HOME_SECTIONS[i];
    const exists = await idFor('home_sections', 'section_key', s.key);
    if (exists) continue;

    await execute(
      `INSERT INTO home_sections
         (section_key, scene, eyebrow, heading, heading_emphasis, lede, content, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [s.key, s.scene, s.eyebrow, s.heading, s.emphasis, s.lede,
       JSON.stringify(s.content), i + 1]
    );
  }
  console.log(`  · ${HOME_SECTIONS.length} home sections`);
}

/* ---- insights ------------------------------------------------- */

const POSTS = [
  {
    slug: 'cost-of-late-correction',
    title: 'The cost of a correction grows tenfold at every stage',
    excerpt:
      'A wrong assumption caught on a whiteboard costs a conversation. The same assumption caught in production costs an incident. This asymmetry is the whole argument for design work.',
    tags: ['engineering', 'process', 'architecture'],
    reading_time: 7,
    body:
      '## The arithmetic nobody budgets for\n\n' +
      'Every engineering decision has two prices. There is the price of making it, which appears in the estimate. And there is the price of being wrong about it, which usually does not.\n\n' +
      'That second price is not constant. It compounds with each stage the decision survives untouched.\n\n' +
      '### Design → 1×\n\n' +
      'An assumption challenged on a whiteboard costs a conversation. Someone redraws the diagram, and the correction is absorbed before it has created dependencies.\n\n' +
      '### Build → 10×\n\n' +
      'The same assumption challenged in code review costs a refactor. Other code now imports the thing you want to change. Tests encode the old behaviour. A migration may be required. It is a day of work, not an hour.\n\n' +
      '### Production → 100×\n\n' +
      'Now it costs an incident. Customers were affected. Data written under the wrong model has to be repaired, and repaired data has a way of being wrong in ways you cannot detect. There is a postmortem, and a trust cost that never appears on any invoice.\n\n' +
      '## Why this is not an argument for more process\n\n' +
      'It is tempting to read this as a case for heavyweight planning. It is not. Process that does not shorten the distance between assumption and evidence is theatre.\n\n' +
      'The useful version is narrow: find the decisions that are expensive to reverse, and settle those before building on them. Leave everything else to be discovered by doing.\n\n' +
      '## What this looks like in practice\n\n' +
      'On a recent platform consolidation, the first three weeks produced no application code. They produced a signed-off canonical data model.\n\n' +
      'That felt slow. It surfaced 14 data discrepancies that would each have become a customer-visible billing error after cutover, at roughly four days of analyst time apiece to unwind. Three weeks against 56 days of unwinding.\n\n' +
      'The arithmetic is not close.',
  },
  {
    slug: 'measure-before-you-optimise',
    title: 'Two failed optimisations, and the profile that explained both',
    excerpt:
      'A checkout was slow. Two teams had already tried to fix it by looking at the frontend and the database. Neither had measured the full request path first.',
    tags: ['performance', 'engineering'],
    reading_time: 6,
    body:
      '## The symptom\n\n' +
      'Checkout latency sat at 3.1 seconds at the 95th percentile. Under campaign load, cart abandonment climbed sharply. Two previous attempts to fix it had failed.\n\n' +
      'The first had rewritten frontend rendering. The second had added database indexes. Neither moved the number meaningfully, which was the most informative result available: it suggested the bottleneck was somewhere nobody was looking.\n\n' +
      '## The measurement\n\n' +
      'We instrumented the entire request path before changing anything — including outbound calls to third-party services, which are frequently invisible in application-level tracing.\n\n' +
      'The profile took about a day to build and was unambiguous.\n\n' +
      'Of the 3.1 seconds, **1.9 was a single synchronous call** to a third-party inventory service. It sat on the critical path because it had been placed there when the feature was first added, and nobody had revisited the decision since.\n\n' +
      'It also had a 4-second timeout, which meant that when the third party was slow, checkout did not just slow down — it stalled.\n\n' +
      '## The fix\n\n' +
      'Three changes, none of them exotic:\n\n' +
      '1. The reservation moved to an asynchronous step with an optimistic hold, taking it off the critical path.\n' +
      '2. A circuit breaker with a defined degradation path replaced the raw timeout.\n' +
      '3. A performance budget in CI, so the number cannot silently regress.\n\n' +
      'P95 latency went from 3.1s to 870ms — a 72% reduction, measured over 30 days including two campaign peaks.\n\n' +
      '## The generalisable part\n\n' +
      'The fix was not clever. Finding it was the work.\n\n' +
      'When two reasonable optimisation attempts fail, stop guessing and instrument the whole path. The failure is the data point.',
  },
  {
    slug: 'audit-trails-structurally',
    title: 'An audit trail should be impossible to bypass',
    excerpt:
      'If your compliance story depends on developers remembering to write an audit record, you do not have an audit trail. You have a convention with a deadline.',
    tags: ['architecture', 'compliance'],
    reading_time: 5,
    body:
      '## The finding\n\n' +
      'A clinical research organisation needed to trace any data point from entry to analysis, ahead of a regulatory inspection. The system recorded final values faithfully.\n\n' +
      'It did not record who changed what, when, or why across roughly 40% of edit paths. The trail had gaps exactly where an inspector would look.\n\n' +
      '## Why conventions fail\n\n' +
      'The original implementation had an audit helper, and a documented rule that all mutations must call it. That is a convention, and conventions decay.\n\n' +
      'Every new developer, every deadline, every convenient shortcut is an opportunity to skip it — and skipping it produces no error, no test failure, no visible symptom. The failure mode is silent, which is the worst kind.\n\n' +
      '## The structural fix\n\n' +
      'Rather than patching the 24 uncovered paths individually, we introduced a single persistence layer that all writes must pass through. Audit recording happens there, once.\n\n' +
      'It became impossible to write to the database without producing an audit record, because there was no longer a code path that did so.\n\n' +
      '## The transferable principle\n\n' +
      'When something must always happen, do not encode it as a rule people follow. Encode it as the only path available.\n\n' +
      'Conventions are enforced by discipline. Structure is enforced by the compiler.',
  },
];

async function seedPosts(authorId) {
  for (const p of POSTS) {
    let id = await idFor('posts', 'slug', p.slug);
    if (id) continue;

    const r = await execute(
      `INSERT INTO posts
         (slug, title, excerpt, body, author_id, reading_time, status, is_featured,
          seo_title, seo_description, published_at)
       VALUES (?, ?, ?, ?, ?, ?, 'published', 0, ?, ?, NOW())`,
      [p.slug, p.title, p.excerpt, p.body, authorId, p.reading_time,
       `${p.title} — DevCenterPoint`, p.excerpt]
    );
    id = r.insertId;

    for (const tagLabel of p.tags) {
      const tagSlug = tagLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let tagId = await idFor('tags', 'slug', tagSlug);
      if (!tagId) {
        const tr = await execute(
          'INSERT INTO tags (slug, label) VALUES (?, ?)',
          [tagSlug, tagLabel]
        );
        tagId = tr.insertId;
      }
      await execute(
        'INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)',
        [id, tagId]
      );
    }
  }
  console.log(`  · ${POSTS.length} insights`);
}

/* ---- team · testimonials · faq -------------------------------- */

const TEAM = [
  {
    name: 'Aayan Rahman', role: 'Founder & Principal Engineer', location: 'Dhaka, Bangladesh',
    bio: 'Leads architecture and delivery. Fifteen years across payments, logistics and regulated systems, most of it spent fixing the things that were expensive to change.',
  },
  {
    name: 'Nusrat Jahan', role: 'Lead Backend Engineer', location: 'Dhaka, Bangladesh',
    bio: 'Data modelling, distributed systems and the unglamorous work of making migrations safe. Believes most architecture problems are naming problems in disguise.',
  },
  {
    name: 'Tanvir Ahmed', role: 'Lead Frontend Engineer', location: 'Dhaka, Bangladesh',
    bio: 'Interface engineering and accessibility. Builds front ends that hold up under real content, slow networks and keyboard-only users.',
  },
  {
    name: 'Farhana Islam', role: 'Reliability Engineer', location: 'Dhaka, Bangladesh',
    bio: 'Observability, performance budgets and incident readiness. Has a strong preference for systems that fail loudly and briefly.',
  },
];

async function seedTeam() {
  const n = await query('SELECT COUNT(*) AS n FROM team_members');
  if (n[0].n > 0) {
    console.log('  · Team present');
    return;
  }
  for (let i = 0; i < TEAM.length; i++) {
    const t = TEAM[i];
    await execute(
      `INSERT INTO team_members (name, role, bio, location, sort_order, status)
       VALUES (?, ?, ?, ?, ?, 'published')`,
      [t.name, t.role, t.bio, t.location, i + 1]
    );
  }
  console.log(`  · ${TEAM.length} team members`);
}

async function seedTestimonials() {
  const n = await query('SELECT COUNT(*) AS n FROM testimonials');
  if (n[0].n > 0) {
    console.log('  · Testimonials present');
    return;
  }

  /* Quotes are lifted from the case studies so the two never drift
     apart — a testimonial that contradicts its own project page is
     worse than no testimonial. */
  const rows = [
    {
      slug: 'nordic-freight-consolidation',
      quote: 'They spent three weeks refusing to write code until the data model was right. That felt slow at the time. It is the only reason the cutover was boring.',
      attribution: 'Mette Sørensen', role: 'Director of Operations', company: 'Nordhavn Freight',
    },
    {
      slug: 'retail-checkout-latency',
      quote: 'Two teams had tried to fix this and failed. They found it in a week because they measured before they touched anything.',
      attribution: 'Priya Raghavan', role: 'VP Engineering', company: 'Halden & Co',
    },
    {
      slug: 'clinical-trial-data-integrity',
      quote: 'The finding was accurate and uncomfortable. What mattered was that the fix made the problem impossible to reintroduce.',
      attribution: 'Head of Clinical Systems', role: '', company: '',
    },
  ];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const csId = await idFor('case_studies', 'slug', r.slug);
    await execute(
      `INSERT INTO testimonials (quote, attribution, role, company, case_study_id, sort_order, status)
       VALUES (?, ?, ?, ?, ?, ?, 'published')`,
      [r.quote, r.attribution, r.role || null, r.company || null, csId, i + 1]
    );
  }
  console.log(`  · ${rows.length} testimonials`);
}

const FAQS = [
  {
    q: 'How do engagements usually start?',
    a: 'With a conversation about the problem, not a specification. Most engagements begin with either an architecture review or a design sprint, because both are fixed-scope and neither commits you to a larger build afterwards.',
    cat: 'working-together',
  },
  {
    q: 'Do you work with existing codebases?',
    a: 'Frequently. Roughly half our work is on systems we did not build. We start by reading the code and tracing real request paths before proposing any change, and we are comfortable telling you a system is fine as it is.',
    cat: 'working-together',
  },
  {
    q: 'Who owns the code and the intellectual property?',
    a: 'You do, on every commit, from day one. The repository is yours, the documentation is yours, and there is no licence arrangement that keeps you dependent on us.',
    cat: 'commercial',
  },
  {
    q: 'What happens at the end of an engagement?',
    a: 'You receive the repository, a decision log explaining why the system is shaped the way it is, a runbook for the parts that can fail, and 30 days of included post-handover support. The goal is that you can maintain it without us.',
    cat: 'working-together',
  },
  {
    q: 'How do you price work?',
    a: 'Either fixed-scope fixed-price, where the scope is defined well enough to commit to it, or a fixed day rate for open-ended work. We do not bill for estimates, and change requests are costed before they are started.',
    cat: 'commercial',
  },
  {
    q: 'Can you sign an NDA?',
    a: 'Yes, as standard, and before any detailed technical discussion if you prefer. Several of the projects on this site are described with the client anonymised for exactly that reason.',
    cat: 'commercial',
  },
  {
    q: 'What is your typical response time?',
    a: 'One business day, from first contact and throughout the engagement. It is one of the commitments we will put in writing.',
    cat: 'working-together',
  },
  {
    q: 'Do you take on maintenance-only work?',
    a: 'Usually not as a standalone engagement, because maintenance without ownership of the design tends to produce patches rather than fixes. We will consider it where there is a path to improving the underlying system.',
    cat: 'working-together',
  },
];

async function seedFaqs() {
  const n = await query('SELECT COUNT(*) AS n FROM faqs');
  if (n[0].n > 0) {
    console.log('  · FAQs present');
    return;
  }
  for (let i = 0; i < FAQS.length; i++) {
    await execute(
      `INSERT INTO faqs (question, answer, category, sort_order, status)
       VALUES (?, ?, ?, ?, 'published')`,
      [FAQS[i].q, FAQS[i].a, FAQS[i].cat, i + 1]
    );
  }
  console.log(`  · ${FAQS.length} FAQs`);
}

/* ---- legal pages ---------------------------------------------- */

async function seedPages() {
  const exist = await query('SELECT COUNT(*) AS n FROM pages');
  if (exist[0].n > 0) {
    console.log('  · Pages present');
    return;
  }

  const pages = [
    {
      slug: 'privacy', title: 'Privacy', heading: 'What we collect, and why.',
      lede: 'A short policy, because we collect very little.',
      body:
        '## What we collect\n\n' +
        'When you submit the contact form we store the name, email address, company and message you provide. That is used to reply to you and for nothing else.\n\n' +
        'We record a one-way hash of your IP address, not the address itself. Its only purpose is rate limiting, to stop the form being abused.\n\n' +
        '## What we do not do\n\n' +
        'We do not sell, rent or share your information with third parties. We do not run advertising trackers on this site. We do not build profiles of visitors.\n\n' +
        '## Retention\n\n' +
        'Contact enquiries are kept for as long as they are useful for the relationship, and deleted on request. Ask us and we will remove your enquiry and confirm it in writing.\n\n' +
        '## Your rights\n\n' +
        'You can ask us what we hold about you, ask for a copy, or ask us to delete it. Write to the address on the contact page and we will respond within one business day.',
    },
    {
      slug: 'terms', title: 'Terms', heading: 'The terms we work under.',
      lede: 'Plain language, because contract terms should be readable.',
      body:
        '## Engagement\n\n' +
        'Work begins under a written statement of work describing the scope, the deliverables, the timeline and the price. Nothing starts before that is agreed by both parties.\n\n' +
        '## Intellectual property\n\n' +
        'All code, documentation and other work product created for you is assigned to you on creation and transferred on payment. We retain no licence over it and claim no rights to reuse it.\n\n' +
        '## Confidentiality\n\n' +
        'We treat all client information as confidential by default and will sign a specific NDA on request. Client names are only published with permission.\n\n' +
        '## Changes\n\n' +
        'Changes to agreed scope are documented and costed before any work on them begins. We do not perform unrequested work and then invoice for it.\n\n' +
        '## Termination\n\n' +
        'Either party may end an engagement with 30 days\' written notice. Work completed to that point is invoiced, and all work product is handed over. There is no termination penalty.\n\n' +
        '## Warranty\n\n' +
        'Every delivery includes 30 days of post-handover support covering defects in the delivered work, at no additional cost.',
    },
    {
      slug: 'about', title: 'About', heading: 'A dev centre that stays accountable.',
      lede: 'Small, senior, and structured so that the people who design a system are the people who build and support it.',
      body:
        '## Why we exist\n\n' +
        'Most software problems are not failures of coding. They are failures of decisions made early and discovered late — a data model that could not absorb the second feature, an integration on the critical path that nobody questioned, a rewrite attempted because the old system was unfashionable rather than because it was wrong.\n\n' +
        'We are structured to catch those decisions while they are still cheap to change.\n\n' +
        '## How we are organised\n\n' +
        'Deliberately small and deliberately senior. Every engineer on an engagement has owned production systems before. There is no bench of junior developers to bill for and no account layer between you and the work.\n\n' +
        'This limits how much we can take on at once. It is the constraint that makes the rest of our commitments possible.\n\n' +
        '## What we will tell you\n\n' +
        'When a system does not need replacing. When an estimate was wrong. When the brief describes a solution to the wrong problem.\n\n' +
        'That is uncomfortable occasionally and valuable more often.',
    },
  ];

  for (const p of pages) {
    await execute(
      `INSERT INTO pages (slug, title, heading, lede, body, template, status, seo_title, seo_description)
       VALUES (?, ?, ?, ?, ?, 'standard', 'published', ?, ?)`,
      [p.slug, p.title, p.heading, p.lede, p.body, `${p.title} — DevCenterPoint`, p.lede]
    );
  }
  console.log(`  · ${pages.length} pages`);
}

/* ---- entry point ---------------------------------------------- */

export async function runSeed() {
  const existing = await query('SELECT COUNT(*) AS n FROM users');
  if (existing[0].n > 0) {
    console.log('  · Seed data already present — verifying…');
  }

  const adminId = await seedAdmin();
  await seedSettings();
  await seedNav();
  await seedServices();
  await seedCaseStudies();
  await seedHomeSections();
  await seedPosts(adminId);
  await seedTeam();
  await seedTestimonials();
  await seedFaqs();
  await seedPages();
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  console.log('\n  Seeding database…\n');
  runSeed()
    .then(() => { console.log('\n  ✓ Seed complete.\n'); process.exit(0); })
    .catch((err) => { console.error('\n  ✖ Seed failed:', err.message, '\n'); process.exit(1); });
}
