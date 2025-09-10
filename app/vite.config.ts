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
        // Set content type for service worker files
        if (req.url?.endsWith('.js') && (req.url?.includes('/sw.js') || req.url?.includes('/service-worker.js') || req.url?.includes('/registerSW.js'))) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Service-Worker-Allowed', '/');
        }
        
        // Set content type for manifest file
        if (req.url?.endsWith('.webmanifest') || req.url?.endsWith('.json')) {
          res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
        }
        
        // Set content type for module JS files
        if (req.url?.endsWith('.js') || req.url?.endsWith('.mjs')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
        
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        // Service worker files
        if (req.url?.endsWith('/sw.js') || req.url?.includes('sw.js') || req.url?.includes('service-worker.js') || req.url?.includes('registerSW.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Service-Worker-Allowed', '/');
        }
        
        // Manifest files
        if (req.url?.endsWith('.webmanifest') || req.url?.endsWith('manifest.json')) {
          res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
        }
        
        next();
      });
    }
  };
};

export default defineConfig({
  // Use relative paths for local development and preview
  base: '/',  // Always use root path for development and preview
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
        start_url: '/',
        display: 'standalone',
        background_color: '#0b1220',
        theme_color: '#0ea5e9',
        icons: [
          { 
            src: '/icons/icon-192.png',
            sizes: '192x192', 
            type: 'image/png', 
            purpose: 'any maskable' 
          },
          { 
            src: '/icons/icon-512.png',
            sizes: '512x512', 
            type: 'image/png', 
            purpose: 'any maskable' 
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,json}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          { 
            urlPattern: /\/api\//, 
            handler: 'NetworkFirst', 
            options: { 
              cacheName: 'api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              }
            } 
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  server: { 
    port: 5173,
    headers: {
      'Service-Worker-Allowed': '/',
      'Access-Control-Allow-Origin': '*'
    },
    ...(process.env.HTTPS === 'true'
      ? {
          https: {
            key: fs.readFileSync(path.resolve(__dirname, 'localhost+3-key.pem')),
            cert: fs.readFileSync(path.resolve(__dirname, 'localhost+3.pem')),
          },
          host: true, // This enables listening on all network interfaces
        }
      : {})
  },
  preview: {
    port: 4173,
    headers: {
      'Service-Worker-Allowed': '/',
      'Access-Control-Allow-Origin': '*'
    }
  }
});
