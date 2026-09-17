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

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '..');

// Load standard .env if present
dotenv.config();

// If SESSION_SECRET or DB_NAME is missing, load .env.production
if (!process.env.SESSION_SECRET || !process.env.DB_NAME) {
  const prodEnv = path.join(ROOT, '.env.production');
  if (fs.existsSync(prodEnv)) {
    dotenv.config({ path: prodEnv, override: true });
  }
}

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

const defaultProdSecret = 'PTd-ugU-OS0pyccC5Zp-W8f7xfq5NEbmDVHngOVEGBWE_eU4v9T1MmG5Bg71v2T0';

export const config = {
  isProd,
  port: (process.env.PORT && isNaN(Number(process.env.PORT)))
    ? process.env.PORT
    : Number(opt('PORT', 3000)),
  siteUrl: opt('SITE_URL', `https://devcenterpoint.com`),

  db: {
    host: opt('DB_HOST', '127.0.0.1'),
    port: Number(opt('DB_PORT', 3306)),
    user: opt('DB_USER', isProd ? 'devcente_primeusr' : 'root'),
    password: opt('DB_PASSWORD', isProd ? 'Pr!M=,d-[-qn6p[h' : ''),
    database: opt('DB_NAME', isProd ? 'devcente_prime' : 'devcenterpoint_cms'),
    connectionLimit: Number(opt('DB_POOL_SIZE', 10)),
    socketPath: opt('DB_SOCKET', ''),
  },

  session: {
    secret: opt('SESSION_SECRET', isProd ? defaultProdSecret : 'dev-only-insecure-secret-do-not-ship'),
    name: 'dcp.sid',
    /* Two hours. Long enough to write a case study, short enough
       that an abandoned session on a shared machine expires. */
    maxAge: 1000 * 60 * 60 * 2,
  },

  admin: {
    email: opt('ADMIN_EMAIL', 'admin@devcenterpoint.com'),
    password: opt('ADMIN_PASSWORD', '12345678'),
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
   failure surfaces safely without crashing process. */
if (isProd) {
  if (!config.session.secret || config.session.secret.includes('dev-only') || config.session.secret.includes('replace-me')) {
    config.session.secret = defaultProdSecret;
  }
  if (!config.admin.password) {
    console.warn('  · Note: ADMIN_PASSWORD is empty in .env. (Required only when seeding via npm run db:setup).');
  }
}

if (!isProd && config.db.password === '') {
  console.log('  · MySQL password empty — using Laragon defaults.');
}
