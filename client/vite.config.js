import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Serve the public landing page at "/" and the React app at "/app".
// The landing page (public/landing.html) is the public front door; the React app
// — which handles auth — lives behind "/app". The same rewrite is applied to both
// the dev server and `vite preview` so routing is identical either way.
function rewrite(req) {
  const path = (req.url || '/').split('?')[0];
  if (path === '/' || path === '/index.html') {
    // Root → static landing page served from publicDir.
    req.url = '/landing.html';
  } else if (path === '/app' || path === '/app/') {
    // /app → the React app's index.html (the React build entry).
    req.url = '/index.html';
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
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the Express server in dev.
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
