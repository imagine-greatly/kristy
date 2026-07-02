import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

// Serve the public landing page at "/" and the React app at "/app".
// The landing page (public/landing.html) is the public front door; the React app
// — which handles auth — lives behind "/app" and is built from app.html (NOT
// index.html). Keeping the app OUT of the root index.html slot is what lets the
// "/" → landing rewrite work in production: on Vercel the filesystem is checked
// before rewrites, so a real dist/index.html would shadow "/". See vercel.json.
//
// This same rewrite runs on the dev server and `vite preview`, so routing is
// identical in dev, preview, and production.
function rewrite(req) {
  const path = (req.url || '/').split('?')[0];
  if (path === '/' || path === '/index.html') {
    // Root → static landing page served from publicDir.
    req.url = '/landing.html';
  } else if (path === '/app' || path === '/app/' || path.startsWith('/app/')) {
    // /app (and any deep link under it) → the React app entry.
    req.url = '/app.html';
  }
}

function landingRoutes() {
  return {
    name: 'kristy-landing-routes',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req);
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), landingRoutes()],
  build: {
    rollupOptions: {
      // The React app's HTML entry is app.html so the production build has no
      // root index.html (which would otherwise shadow the "/" → landing rewrite).
      input: fileURLToPath(new URL('./app.html', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Dev-only: forward /api calls to the local Express server. In production
      // the client talks to the server via VITE_API_URL (see src/lib/config.js),
      // so this proxy is never used in the Vercel build.
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
