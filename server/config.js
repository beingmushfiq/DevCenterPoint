/* ============================================================
   CONFIG — the single place that reads process.env.

   Two rules this file exists to enforce:

   1. Nothing else in the app touches `process.env`. Environment
      lookups scattered across a codebase are how you end up with
      a production build quietly reading a dev database.
   2. Missing critical values fail LOUDLY at boot, not silently at
      the first request. A server that starts and then 500s on
      every page is worse than one that refuses to start with a
      clear message.
   ============================================================ */

import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(here, '..');

/* Production is opted into explicitly, via `--prod` or NODE_ENV.
   We never infer it — inferring has cost too many people their
   staging database. */
const isProd = process.argv.includes('--prod') || process.env.NODE_ENV === 'production';

function fail(message) {
  console.error(`\n  ✖ Configuration error\n    ${message}\n`);
  process.exit(1);
}

/* Returns a required string, or dies with a helpful message. */
function req(key) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    fail(
      `Missing required environment variable: ${key}\n` +
      `    Copy .env.example to .env and fill it in.`
    );
  }
  return value;
}

/* Optional, with a default. Empty string is treated as absent so
   that `DB_PASSWORD=` (a legitimate value for a local root user)
   does not read as "unset". */
function opt(key, fallback = '') {
  const value = process.env[key];
  return value === undefined ? fallback : value;
}

export const config = {
  isProd,
  port: Number(opt('PORT', 3000)),
  siteUrl: opt('SITE_URL', `http://localhost:${opt('PORT', 3000)}`),

  db: {
    host: opt('DB_HOST', '127.0.0.1'),
    port: Number(opt('DB_PORT', 3306)),
    user: opt('DB_USER', 'root'),
    // Laragon's root account ships without a password, so an empty
    // string is the expected local value — not an error.
    password: opt('DB_PASSWORD', ''),
    database: opt('DB_NAME', 'devcenterpoint_cms'),
    connectionLimit: Number(opt('DB_POOL_SIZE', 10)),
  },

  session: {
    secret: isProd
      ? req('SESSION_SECRET')
      : opt('SESSION_SECRET', 'dev-only-insecure-secret-do-not-ship'),
    name: 'dcp.sid',
    /* Two hours. Long enough to write a case study, short enough
       that an abandoned session on a shared machine expires. */
    maxAge: 1000 * 60 * 60 * 2,
  },

  admin: {
    email: opt('ADMIN_EMAIL', 'admin@devcenterpoint.com'),
    password: opt('ADMIN_PASSWORD', ''),
    name: opt('ADMIN_NAME', 'Administrator'),
  },

  paths: {
    root: ROOT,
    server: path.join(ROOT, 'server'),
    views: path.join(ROOT, 'views'),
    migrations: path.join(ROOT, 'migrations'),
    client: path.join(ROOT, 'client'),
    public: path.join(ROOT, 'public'),
    uploads: path.join(ROOT, 'public', 'uploads'),
    dist: path.join(ROOT, 'dist'),
  },
};

/* Guard rails that only matter in production. Checked here so the
   failure surfaces at boot rather than at the first login. */
if (isProd) {
  if (!config.session.secret || config.session.secret.includes('dev-only') || config.session.secret.includes('replace-me')) {
    fail('SESSION_SECRET must be set to a secure random string when running in production.');
  }
  if (!config.admin.password) {
    console.warn('  · Note: ADMIN_PASSWORD is empty in .env. (Required only when seeding via npm run db:setup).');
  }
}

if (!isProd && config.db.password === '') {
  console.log('  · MySQL password empty — using Laragon defaults.');
}
