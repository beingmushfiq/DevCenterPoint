/**
 * DevCenterPoint — cPanel Phusion Passenger CommonJS Loader
 *
 * Phusion Passenger in cPanel CloudLinux sometimes initiates apps
 * using CommonJS. This bridge asynchronously loads the ES module
 * entry point (`app.js`) and handles any uncaught boot exceptions.
 */

async function boot() {
  try {
    await import('./app.js');
  } catch (err) {
    console.error('✖ Fatal startup error inside loader.cjs:', err);
    process.exit(1);
  }
}

boot();
