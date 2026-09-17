/* ============================================================
   DATABASE POOL

   One pool for the whole process. mysql2/promise gives us async
   query methods and — more importantly — real prepared statements
   via `.execute()`, which is the difference between "we intended
   to prevent SQL injection" and "we did".
   ============================================================ */

import mysql from 'mysql2/promise';
import { config } from '../config.js';

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  socketPath: config.db.socketPath || undefined,
  waitForConnections: true,
  connectionLimit: config.db.connectionLimit,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  timezone: 'Z',
  /* Keep DECIMAL/BIGINT as strings. JavaScript numbers lose
     precision past 2^53, and a CMS that silently corrupts a large
     metric is worse than one that returns a string. */
  decimalNumbers: false,
  supportBigNumbers: true,
  bigNumberStrings: true,
  /* Return DATE/DATETIME as strings rather than JS Date objects.
     Date objects carry the server's timezone into templates and
     render as the wrong day surprisingly often. */
  dateStrings: true,
});

/* ---- Query helpers ----------------------------------------

   `query()`  — for dynamic SQL (migrations, admin filters).
   `execute()` — for anything taking user input. Always prefer
                 this one; it uses server-side prepared statements.
   ------------------------------------------------------------ */

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

/* Returns the first row, or null. Keeps route code free of
   `rows[0] ?? null` noise. */
export async function one(sql, params = []) {
  const rows = await execute(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/* ---- Transactions -----------------------------------------

   Takes a callback and hands it a connection. Commits on success,
   rolls back on any throw. Case-study saves touch half a dozen
   tables; a partial write there would leave the CMS showing a
   project with no metrics and no images.
   ------------------------------------------------------------ */

export async function transaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/* Verifies the database is reachable and the schema exists.
   Called at boot so a stopped MySQL produces one clear line
   instead of a wall of stack traces on the first page view. */
export async function healthCheck() {
  try {
    const row = await one(
      'SELECT VERSION() AS version, DATABASE() AS db'
    );
    return { ok: true, version: row.version, database: row.db };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export async function closePool() {
  await pool.end();
}
