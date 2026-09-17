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
  const { host, port, user, password, database, socketPath } = config.db;

  const connOpts = {
    host,
    port,
    user,
    password,
    socketPath: socketPath || undefined,
    multipleStatements: true,
  };

  let conn;
  // 1. Try connecting directly to the specified database (standard on cPanel where DB is already created)
  try {
    conn = await mysql.createConnection({ ...connOpts, database });
    const [[{ version }]] = await conn.query('SELECT VERSION() AS version');
    await conn.end();
    return version;
  } catch (err) {
    if (err.code === 'ER_BAD_DB_ERROR') {
      // Database does not exist yet (local dev environment) — create it
      try {
        conn = await mysql.createConnection(connOpts);
        await conn.query(
          `CREATE DATABASE IF NOT EXISTS \`${database}\`
           CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
        const [[{ version }]] = await conn.query('SELECT VERSION() AS version');
        await conn.end();
        return version;
      } catch (createErr) {
        console.error(`\n  ✖ Could not create database \`${database}\`: ${createErr.message}\n`);
        process.exit(1);
      }
    } else {
      console.error('\n  ✖ Could not reach MySQL.\n');
      if (err.code === 'ECONNREFUSED') {
        console.error(`    Nothing is listening on ${host}:${port}.`);
      } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error(`    MySQL rejected user "${user}". Check DB_USER / DB_PASSWORD in .env.\n`);
      } else {
        console.error(`    ${err.message}\n`);
      }
      process.exit(1);
    }
  }
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
