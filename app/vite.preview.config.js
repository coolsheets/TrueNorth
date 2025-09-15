import { defineConfig } from 'vite';

export default defineConfig({
  preview: {
    port: 4173,
    strictPort: true,
    configure: (server) => {
      server.middlewares.use((req, res, next) => {
        if (req.url.endsWith('.js') || req.url.endsWith('.mjs')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
        if (req.url.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
        }
        if (req.url.endsWith('.webmanifest')) {
          res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
        }
        if (req.url === '/sw.js') {
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Service-Worker-Allowed', '/');
        }
        next();
      });
    },
  },
});
