/* ============================================================
   DATABASE SETUP  —  `npm run db:setup`

   Idempotent. Creates the database if absent, then runs every
   migration and the seed. Safe to re-run; safe to run on a fresh
   machine; safe to run twice by accident.

   Deliberately uses a connection WITHOUT a `database` selected,
   because the whole point is to create that database. Everything
   else in the app connects with the database already chosen.
   ============================================================ */

import mysql from 'mysql2/promise';
import { config } from '../config.js';
import { runMigrations } from './migrate.js';
import { runSeed } from './seed.js';

async function ensureDatabase() {
  const { host, port, user, password, database } = config.db;

  let conn;
  try {
    conn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  } catch (err) {
    console.error('\n  ✖ Could not reach MySQL.\n');
    if (err.code === 'ECONNREFUSED') {
      console.error(`    Nothing is listening on ${host}:${port}.`);
      console.error('    Start MySQL — with Laragon, use "Start All".');
      console.error('    Note: do NOT start the "MySQL80" Windows service;');
      console.error('    it and Laragon both want port 3306 and will conflict.\n');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(`    MySQL rejected user "${user}".`);
      console.error('    Check DB_USER / DB_PASSWORD in .env.\n');
    } else {
      console.error(`    ${err.message}\n`);
    }
    process.exit(1);
  }

  /* `devcenterpoint_cms` is namespaced so it can never collide with
     the existing databases on this server (leadlayer_crm,
     ordershield_oms, …). */
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );

  const [[{ version }]] = await conn.query('SELECT VERSION() AS version');
  await conn.end();
  return version;
}

async function main() {
  console.log('\n  DevCenterPoint — database setup\n');

  const version = await ensureDatabase();
  console.log(`  · MySQL ${version} reachable at ${config.db.host}:${config.db.port}`);
  console.log(`  · Database \`${config.db.database}\` ready`);

  await runMigrations();
  await runSeed();

  console.log('\n  ✓ Setup complete.\n');
  console.log(`    Admin:    ${config.admin.email}`);
  console.log(`    Password: ${config.admin.password ? '(set in .env)' : '(NOT SET — see .env)'}`);
  console.log(`    Sign in:  ${config.siteUrl}/admin/login\n`);

  process.exit(0);
}

main().catch((err) => {
  console.error('\n  ✖ Setup failed:', err.message, '\n');
  process.exit(1);
});
