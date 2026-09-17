/**
 * DevCenterPoint — cPanel Phusion Passenger CommonJS Bootstrapper
 *
 * Phusion Passenger requires a CommonJS entry point using `require()`.
 * This wrapper uses dynamic `import()` to cleanly launch our ES Module
 * Express application without triggering `ERR_REQUIRE_ESM`.
 */

try {
  const fs = require('fs');
  const path = require('path');
  const dotenv = require('dotenv');
  const prodEnv = path.join(__dirname, '.env.production');
  const localEnv = path.join(__dirname, '.env');
  if (!fs.existsSync(localEnv) && fs.existsSync(prodEnv)) {
    dotenv.config({ path: prodEnv });
  } else {
    dotenv.config();
  }
} catch (e) {
  // ignore
}

(async () => {
  try {
    await import('./server/index.js');
  } catch (err) {
    console.error('Fatal startup error in start.cjs:', err);
    console.error(err && err.stack ? err.stack : err);
  }
})();
