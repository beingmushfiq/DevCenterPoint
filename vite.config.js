import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

/* ============================================================
   VITE — asset pipeline only.

   `appType: 'custom'` is the important line. Express owns routing
   and HTML; Vite is demoted to what it is genuinely good at:
   compiling, hashing and serving JS/CSS. Without this, Vite would
   try to serve its own index.html and fight Express for the
   request.

   Two entries, because the marketing site and the admin panel have
   no reason to share a bundle. The admin should never download
   Three.js, and a visitor should never download form-editor code.
   ============================================================ */

export default defineConfig({
  appType: 'custom',
  publicDir: 'public',

  server: {
    /* Vite runs inside Express, so it must not open its own port.
       The dev URL is Express's port (3000). */
    middlewareMode: true,
    hmr: { port: 24678 },
    fs: { strict: false },
  },

  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    /* The server reads this to find hashed filenames. Without a
       manifest, Express has no way to know that base.css became
       base-a1b2c3.css. */
    manifest: true,
    rollupOptions: {
      input: {
        site: path.resolve(root, 'src/entries/site.js'),
        admin: path.resolve(root, 'src/entries/admin.js'),
      },
      output: {
        /* Split the heavy 3D engine and the motion libraries away
           from the app shell. The hero markup, type and colours
           paint immediately; three/gsap/lenis stream in behind. */
        manualChunks: {
          three: ['three'],
          motion: ['gsap', 'lenis'],
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
