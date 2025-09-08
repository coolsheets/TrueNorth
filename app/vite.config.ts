import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

// Custom plugin to ensure service worker files get the correct MIME type
function serviceWorkerContentTypePlugin(): Plugin {
  return {
    name: 'configure-service-worker-content-type',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Check if the request is for a service worker file
        if (req.url?.endsWith('.js') && (req.url?.includes('/sw.js') || req.url?.includes('/service-worker.js') || req.url?.includes('/registerSW.js'))) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Service-Worker-Allowed', '/');
        }
        next();
      });
    }
  };
};

export default defineConfig({
  // Base path for GitHub Pages
  base: '/TrueNorth/',
  plugins: [
    react(),
    serviceWorkerContentTypePlugin(),
    VitePWA({
      registerType: 'prompt', // Change to manual registration
      includeAssets: ['icons/*'],
      injectRegister: 'script', // Change to script to avoid auto registration issues
      strategies: 'generateSW',
      filename: 'sw.js', // Explicitly set the service worker filename
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      },
      manifest: {
        name: 'PPI Canada',
        short_name: 'PPI',
        start_url: '/TrueNorth/',
        display: 'standalone',
        background_color: '#0b1220',
        theme_color: '#0ea5e9',
        icons: [
          { src: '/TrueNorth/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/TrueNorth/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/TrueNorth/index.html',
        runtimeCaching: [
          { urlPattern: /\/api\//, handler: 'NetworkFirst', options: { cacheName: 'api' } }
        ]
      }
    })
  ],
  server: { 
    port: 5173,
    ...(process.env.HTTPS === 'true'
      ? {
          https: {
            key: fs.readFileSync(path.resolve(__dirname, 'key.pem')),
            cert: fs.readFileSync(path.resolve(__dirname, 'cert.pem')),
          },
          host: true, // This enables listening on all network interfaces
        }
      : {})
  }
});
