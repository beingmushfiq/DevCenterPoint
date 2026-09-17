/* ============================================================
   MIGRATION RUNNER

   Small, dependency-free, and idempotent. Reads `migrations/*.sql`
   in filename order and applies anything not already recorded in
   `schema_migrations`.

   Why hand-rolled rather than a library: this app has exactly one
   database engine, runs on one machine, and needs the runner to
   work before any tables exist. A 60-line runner that we fully
   understand beats a framework we have to debug.

   Convention: `NNN_description.sql`, applied in ascending order.
   Never edit an applied migration — add a new one.
   ============================================================ */

import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { config } from '../config.js';
import { query } from './pool.js';

const MIGRATIONS_DIR = config.paths.migrations;

async function ensureLedger(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    VARCHAR(255) NOT NULL,
      applied_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (filename)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function appliedMigrations() {
  const rows = await query('SELECT filename FROM schema_migrations');
  return new Set(rows.map((r) => r.filename));
}

async function listMigrationFiles() {
  let entries;
  try {
    entries = await fs.readdir(MIGRATIONS_DIR);
  } catch {
    return [];
  }
  return entries
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, 'en'));
}

export async function runMigrations({ quiet = false } = {}) {
  const log = quiet ? () => {} : (...a) => console.log(...a);

  /* A dedicated connection with multipleStatements enabled, because
     a single .sql file legitimately contains many statements.
     The app's shared pool deliberately does NOT enable this — it
     widens the blast radius of any injection bug. */
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    socketPath: config.db.socketPath || undefined,
    multipleStatements: true,
  });

  try {
    await ensureLedger(conn);
    const done = await appliedMigrations();
    const files = await listMigrationFiles();

    if (files.length === 0) {
      log('  · No migrations found.');
      return { applied: 0 };
    }

    let applied = 0;
    for (const file of files) {
      if (done.has(file)) continue;

      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      log(`  · Applying ${file}`);

      try {
        await conn.query(sql);
      } catch (err) {
        /* Stop at the first failure. A half-migrated database is
           recoverable; one where we pressed on and applied later
           migrations on a broken foundation is not. */
        console.error(`\n  ✖ Migration failed: ${file}\n    ${err.message}\n`);
        throw err;
      }

      await conn.query(
        'INSERT INTO schema_migrations (filename) VALUES (?)',
        [file]
      );
      applied++;
    }

    if (applied === 0) log('  · Schema already up to date.');
    else log(`  · ${applied} migration(s) applied.`);

    return { applied };
  } finally {
    await conn.end();
  }
}

import { fileURLToPath } from 'node:url';

/* Allow direct execution: `npm run db:migrate` */
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  console.log('\n  Running migrations…\n');
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
