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
// Clean URLs for the legal and support pages. Every one of them is printed on an
// EXTERNAL form we do not control — App Store Connect requires a support URL and a
// privacy policy URL, and the legal pages were additionally registered with mobile
// carriers for A2P 10DLC review. So they must resolve at a stable, extensionless path,
// and they must resolve HERE too, or dev and production disagree about a URL somebody
// has already typed somewhere else. The .html paths keep working, so older links do not
// break.
//
// ⚠️ ADDING A PAGE HERE IS TWO EDITS, NOT ONE — this table and `client/vercel.json`.
// This one serves dev and preview; that one serves production. A page added to only one
// of them works perfectly for whoever added it and 404s for everybody else, and the
// person who finds out is a reviewer.
const CLEAN_PAGES = {
  '/privacy': '/privacy.html',
  '/terms': '/terms.html',
  // Required by App Review, and it must resolve before the build is submitted.
  '/support': '/support.html',
};

function rewrite(req) {
  const path = (req.url || '/').split('?')[0];
  const clean = CLEAN_PAGES[path.replace(/\/$/, '')];
  if (path === '/' || path === '/index.html') {
    // Root → static landing page served from publicDir.
    req.url = '/landing.html';
  } else if (clean) {
    req.url = clean;
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
