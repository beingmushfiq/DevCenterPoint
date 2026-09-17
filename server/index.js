/* ============================================================
   SERVER BOOTSTRAP

   Express owns routing and HTML rendering. Vite is attached in
   middleware mode during development, which gives one command, one
   port, and working HMR against a server-rendered page.

   Startup order matters:
     1. config      — fails fast on missing env
     2. database    — fails fast on unreachable MySQL
     3. views       — EJS + helpers
     4. assets      — Vite middleware (dev) or manifest (prod)
     5. routes      — public, then admin, then 404/500 last
   ============================================================ */

import express from 'express';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import crypto from 'node:crypto';
import path from 'node:path';

import { config } from './config.js';
import { healthCheck, closePool } from './db/pool.js';
import { globals } from './middleware/globals.js';
import { notFound, errorHandler } from './middleware/errors.js';
import { initAssets, closeAssets } from './lib/assets.js';

async function main() {
  console.log('\n  DevCenterPoint\n');

  /* ---- 1. database -------------------------------------------
     Checked before anything else. A server that boots against a
     dead database and then 500s on every route is far harder to
     diagnose than one that refuses to start with a clear reason. */
  const health = await healthCheck();
  if (!health.ok) {
    const err = health.error;
    console.error('  ✖ Cannot reach the database.\n');
    if (err.code === 'ECONNREFUSED') {
      console.error(`    Nothing is listening on ${config.db.host}:${config.db.port}.`);
      console.error('    Start MySQL — with Laragon, use "Start All".');
      console.error('    Do NOT start the "MySQL80" Windows service; it conflicts');
      console.error('    with Laragon over port 3306.\n');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error(`    Database "${config.db.database}" does not exist.`);
      console.error('    Run: npm run db:setup\n');
    } else {
      console.error(`    ${err.message}\n`);
    }
    process.exit(1);
  }
  console.log(`  · Database: MySQL ${health.version} / ${health.database}`);

  /* ---- auto-setup database if uninitialized ----------------- */
  try {
    const { query } = await import('./db/pool.js');
    const tables = await query("SHOW TABLES LIKE 'site_settings'");
    if (!tables || tables.length === 0) {
      console.log('  · Uninitialized database detected — running automated migrations & seed...');
      const { runMigrations } = await import('./db/migrate.js');
      const { runSeed } = await import('./db/seed.js');
      await runMigrations();
      await runSeed();
      console.log('  ✓ Automated database setup completed successfully.');
    }
  } catch (dbSetupErr) {
    console.error('  ✖ Auto-migration check notice:', dbSetupErr.message);
  }
  const app = express();

  app.disable('x-powered-by');
  /* Trust the first proxy hop so `req.protocol` and rate limiting
     see the real client address behind a reverse proxy. */
  app.set('trust proxy', 1);

  /* ---- 3. security headers ----------------------------------
     CSP is enabled properly in dev as well as prod. The dev
     exception is Vite's HMR websocket and its inline bootstrap.

     The nonce must exist before Helmet runs, because Helmet builds
     the header synchronously from res.locals. It is only enforced
     in production: in dev Vite injects its own inline bootstrap,
     which cannot carry our nonce, so the dev policy allows inline
     scripts instead. Note that a nonce and 'unsafe-inline' cannot
     coexist — the spec makes the nonce win and silently drops
     'unsafe-inline' — so the two policies must stay separated. */
  app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
  });

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: config.isProd
          /* The fail-safe bootstrap in the layout is inline, so it
             carries the per-request nonce. Everything else is a
             hashed bundle served by us. */
          ? ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`]
          /* Vite injects inline module bootstrap code in dev. */
          : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: config.isProd
          ? ["'self'"]
          : ["'self'", 'ws://localhost:*', 'http://localhost:*'],
        workerSrc: ["'self'", 'blob:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: config.isProd ? [] : null,
      },
    },
    /* Fonts are loaded from Google; their preconnect needs this. */
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  /* ---- 4. parsers -------------------------------------------- */
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  /* ---- 5. sessions -------------------------------------------
     Stored in MySQL, not memory. A memory store loses every
     session on restart — which in development, with HMR-triggered
     restarts, means being logged out constantly. */
  const MySQLStore = MySQLStoreFactory(session);
  const sessionStore = new MySQLStore({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    createDatabaseTable: false,   // declared in 001_init.sql
    schema: {
      tableName: 'sessions',
      columnNames: { session_id: 'session_id', expires: 'expires', data: 'data' },
    },
  });

  sessionStore.on('error', (err) => {
    console.error('  ✖ Session store error:', err.message);
  });

  app.use(session({
    name: config.session.name,
    secret: config.session.secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,                 // active editors stay signed in
    cookie: {
      httpOnly: true,              // unreachable from JavaScript
      sameSite: 'lax',             // blocks cross-site POST forgery
      secure: config.isProd,       // HTTPS-only in production
      maxAge: config.session.maxAge,
    },
  }));

  /* ---- 6. views ---------------------------------------------- */
  app.set('view engine', 'ejs');
  app.set('views', config.paths.views);
  app.set('trust proxy', 1);

  /* Static files:
     1. Uploads (served at /uploads)
     2. Public root assets (favicon.svg, brand marks, robots.txt)
     3. Production compiled bundles from dist/ (immutable hashed assets) */
  app.use('/uploads', express.static(config.paths.uploads, {
    maxAge: config.isProd ? '30d' : 0,
    index: false,
    dotfiles: 'deny',
  }));

  app.use(express.static(config.paths.public, {
    maxAge: config.isProd ? '7d' : 0,
    index: false,
    dotfiles: 'deny',
  }));

  if (config.isProd) {
    app.use(express.static(config.paths.dist, {
      maxAge: '1y',
      immutable: true,
      index: false,
      dotfiles: 'deny',
    }));
  }

  /* Health endpoint for uptime checks and for confirming the
     server is live without touching a rendered page. */
  app.get('/healthz', async (req, res) => {
    const h = await healthCheck();
    res.status(h.ok ? 200 : 503).json({
      ok: h.ok,
      database: h.ok ? h.database : null,
      version: h.ok ? h.version : null,
    });
  });

  /* ---- 7. assets --------------------------------------------- */
  await initAssets(app);

  /* ---- 8. globals -------------------------------------------- */
  app.use(globals);

  /* ---- 9. routes --------------------------------------------- */
  const { publicRoutes } = await import('./routes/public.js');
  app.use('/', publicRoutes);

  const { adminRoutes } = await import('./routes/admin/index.js');
  app.use('/admin', adminRoutes);

  /* ---- 10. terminal handlers ---------------------------------
     Registered last, in this order. Express matches in sequence,
     so a 404 handler placed earlier would swallow every route
     defined after it. */
  app.use(notFound);
  app.use(errorHandler);

  /* ---- listen ------------------------------------------------ */
  const listenTarget = (typeof PhusionPassenger !== 'undefined')
    ? 'passenger'
    : (process.env.PORT || config.port || 3000);

  const server = app.listen(listenTarget, () => {
    console.log(`  · Mode:     ${config.isProd ? 'production' : 'development'}`);
    console.log(`\n  ✓ Running on ${listenTarget}\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n  ✖ Port ${config.port} is already in use.`);
      console.error('    Another server is running. Stop it, or set PORT in .env.\n');
      process.exit(1);
    }
    throw err;
  });

  /* ---- shutdown ----------------------------------------------
     Close the HTTP server first (stop accepting connections), then
     Vite, then the pool. Reversing this order can leave requests
     mid-flight against a closed pool. */
  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n  · ${signal} received — shutting down…`);

    const force = setTimeout(() => {
      console.error('  ✖ Forced exit after timeout.');
      process.exit(1);
    }, 8000);
    force.unref();

    server.close(async () => {
      try {
        await closeAssets();
        await closePool();
        console.log('  ✓ Closed cleanly.\n');
        process.exit(0);
      } catch {
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('\n  ✖ Fatal startup error:\n');
  console.error(err);
  process.exit(1);
});
