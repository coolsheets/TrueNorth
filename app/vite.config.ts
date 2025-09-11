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
        if (req.url?.endsWith('.js') && (req.url?.includes('/sw.js') || req.url?.includes('/service-worker.js') || req.url?.includes('/registerSW.js') || req.url?.includes('/workbox-'))) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Service-Worker-Allowed', '/');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
        
        // Set content type for manifest file
        if (req.url?.endsWith('.webmanifest') || req.url?.endsWith('.json')) {
          res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
        }
        
        // Set content type for icon files
        if (req.url?.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=0');
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
        if (req.url?.endsWith('/sw.js') || req.url?.includes('sw.js') || req.url?.includes('service-worker.js') || req.url?.includes('registerSW.js') || req.url?.includes('/workbox-')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Service-Worker-Allowed', '/');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
        
        // Manifest files
        if (req.url?.endsWith('.webmanifest') || req.url?.endsWith('manifest.json')) {
          res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
        }
        
        // Icon files
        if (req.url?.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=0');
        }
        
        next();
      });
    }
  };
};

export default defineConfig({
  // Determine the base path based on environment
  base: process.env.GITHUB_ACTIONS ? '/TrueNorth/' : '/', // Use repo name for GitHub Pages deployment
  plugins: [
    react(),
    serviceWorkerContentTypePlugin(),
    // Custom plugin to ensure icons are copied correctly
    {
      name: 'copy-icons-plugin',
      buildStart() {
        console.log('Ensuring icons will be copied to the correct location');
      }
    },
    VitePWA({
      registerType: 'prompt', 
      includeAssets: [
        'icons/icon-192.png',  // Explicitly include the critical icons
        'icons/icon-512.png',  // Explicitly include the critical icons
        'icons/screenshot-narrow.png',
        'icons/screenshot-wide.png',
        'sw-skip-waiting.js'
      ],
      injectRegister: 'script',
      strategies: 'generateSW',
      filename: 'sw.js',
      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        type: 'module'
      },
      manifest: {
        name: 'PPI Canada',
        short_name: 'PPI',
        description: 'Pre-Purchase Inspection Application',
        id: '/index.html',
        start_url: '/',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'browser'],
        orientation: 'portrait',
        background_color: '#0b1220',
        theme_color: '#0ea5e9',
        categories: ['productivity', 'utilities'],
        screenshots: [
          {
            src: 'icons/screenshot-wide.png', // Changed to relative path
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'icons/screenshot-narrow.png', // Changed to relative path
            sizes: '750x1334',
            type: 'image/png'
          }
        ],
        icons: [
          // Standard icons for mobile - try with both absolute and relative paths
          { 
            src: 'icons/icon-192.png', // Changed to relative path
            sizes: '192x192', 
            type: 'image/png',
            purpose: 'any'
          },
          { 
            src: 'icons/icon-512.png', // Changed to relative path
            sizes: '512x512', 
            type: 'image/png',
            purpose: 'any'
          },
          // Maskable icons (for Android adaptive icons)
          { 
            src: 'icons/icon-192.png', // Changed to relative path
            sizes: '192x192', 
            type: 'image/png', 
            purpose: 'maskable' 
          },
          { 
            src: 'icons/icon-512.png', // Changed to relative path
            sizes: '512x512', 
            type: 'image/png', 
            purpose: 'maskable' 
          }
        ]
      },
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webmanifest,json}'
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        skipWaiting: false, // This allows us to handle updates with our custom notification
        clientsClaim: true,
        // Add event listener for the SKIP_WAITING message
        additionalManifestEntries: [
          // Use only one format for icons to avoid conflicts
          { url: 'icons/icon-192.png', revision: null },
          { url: 'icons/icon-512.png', revision: null }
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            // Handle API requests when offline by providing a fallback response
            urlPattern: /\/api\/(ai|inspections)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'localhost+3-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'localhost+3.pem'))
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
