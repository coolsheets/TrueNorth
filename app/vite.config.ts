import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

const base = process.env.GITHUB_ACTIONS ? '/TrueNorth/' : '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    {
      name: 'copy-icons-plugin',
      buildStart() {
        console.log('Ensuring icons will be copied to the correct location');
      }
    },
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      strategies: 'generateSW',
      filename: 'sw.js',
      // Include skipWaiting message handling for updates
      selfDestroying: false, // Don't destroy SW on page close
      // Explicitly set the base to match the app's base path
      base: base,
      // The scope should match the base path
      scope: base,
      // Properly configure for GitHub Pages deployment
      injectManifest: {
        additionalManifestEntries: [],
        globDirectory: 'dist',
        swDest: 'dist/sw.js',
      },
      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        type: 'module'
      },
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'sw-skip-waiting.js'],
      manifest: {
        name: 'PPI Canada',
        short_name: 'PPI',
        description: 'Pre-Purchase Inspection Application',
        id: '/index.html',
        start_url: `${base}`,
        scope: `${base}`,
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'browser'],
        orientation: 'portrait',
        background_color: '#0b1220',
        theme_color: '#0ea5e9',
        categories: ['productivity', 'utilities'],
        screenshots: [
          {
            src: 'icons/screenshot-wide.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'icons/screenshot-narrow.png',
            sizes: '750x1334',
            type: 'image/png'
          }
        ],
        icons: [
          { 
            src: `${base}icons/icon-192.png`,
            sizes: '192x192', 
            type: 'image/png',
            purpose: 'any'
          },
          { 
            src: `${base}icons/icon-512.png`,
            sizes: '512x512', 
            type: 'image/png',
            purpose: 'any'
          },
          { 
            src: `${base}icons/icon-192.png`,
            sizes: '192x192', 
            type: 'image/png', 
            purpose: 'maskable' 
          },
          { 
            src: `${base}icons/icon-512.png`,
            sizes: '512x512', 
            type: 'image/png', 
            purpose: 'maskable' 
          }
        ]
      },
      workbox: {
        navigateFallback: `${base}index.html`,
        clientsClaim: true,
        skipWaiting: false,
        // Using built-in Workbox configurations instead of external scripts
        // Handle error conditions properly with built-in Workbox settings
        navigationPreload: true, // Enable navigation preload for better performance
        cleanupOutdatedCaches: true, // Clean up old cache versions
        sourcemap: true, // Generate sourcemaps for easier debugging
        // Ensure we handle network errors gracefully
        runtimeCaching: [
          { 
            urlPattern: /\/api\/(ai|inspections)/,
            handler: 'NetworkFirst', 
            options: { 
              cacheName: 'api', 
              networkTimeoutSeconds: 5,
              // Handle network errors gracefully
              fetchOptions: {
                credentials: 'same-origin'
              },
              // Show a fallback on network error
              plugins: [{
                handlerDidError: async () => {
                  return new Response('Network error, data is temporarily unavailable', {
                    status: 408,
                    headers: { 'Content-Type': 'text/plain' }
                  });
                }
              }]
            } 
          },
          { 
            urlPattern: ({request}) => request.destination === 'document', 
            handler: 'NetworkFirst' 
          },
          { 
            urlPattern: ({request}) => ['style','script','worker'].includes(request.destination), 
            handler: 'StaleWhileRevalidate' 
          },
          { 
            urlPattern: ({request}) => ['image','font'].includes(request.destination), 
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
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
          }
        ],
        additionalManifestEntries: [
        ]
      }
    })
  ],
  server: {
    port: 3000,
      proxy: {
        '/api': 'http://localhost:3000'
      },
    https: (() => {
      // Only use HTTPS if certificates exist (local development)
      try {
        const keyPath = path.resolve(__dirname, 'localhost+3-key.pem');
        const certPath = path.resolve(__dirname, 'localhost+3.pem');
        
        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
          return {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath)
          };
        } else {
          console.log('SSL certificates not found, HTTPS will not be used in dev server');
          return undefined;
        }
      } catch (err) {
        console.log('Error loading SSL certificates, falling back to HTTP:', err instanceof Error ? err.message : String(err));
        return undefined;
      }
    })()
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
