import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['**/*'],
      manifest: {
        name: 'PPI Canada',
        short_name: 'PPI',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b1220',
        theme_color: '#0ea5e9',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,json}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            }
          },
          { 
            urlPattern: /\/api\//, 
            handler: 'NetworkFirst', 
            options: { 
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            } 
          }
        ]
      }
    })
  ],
  server: getServerConfig()
});

/**
 * Generate server configuration with conditional HTTPS support
 * @returns Server configuration object for Vite
 */
function getServerConfig() {
  // Base server config
  const serverConfig = {
    port: parseInt(process.env.PORT || '5173'),
    host: '0.0.0.0', // Allow external access
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://localhost:8080',
        changeOrigin: true
      }
    }
  };
  
  // Only add HTTPS if enabled and certificates exist or are specified
  const useHttps = process.env.USE_HTTPS !== 'false'; // Default to true unless explicitly disabled
  
  if (useHttps) {
    // Get certificate paths from environment or use defaults
    const keyPath = process.env.SSL_KEY_PATH || './key.pem';
    const certPath = process.env.SSL_CERT_PATH || './cert.pem';
    
    // Check if certificate files exist
    const keyExists = fs.existsSync(path.resolve(keyPath));
    const certExists = fs.existsSync(path.resolve(certPath));
    
    // Only configure HTTPS if both files exist
    if (keyExists && certExists) {
      console.log(`Using SSL certificates: ${keyPath} and ${certPath}`);
      Object.assign(serverConfig, {
        https: {
          key: fs.readFileSync(path.resolve(keyPath)),
          cert: fs.readFileSync(path.resolve(certPath))
        }
      });
    } else {
      console.warn(
        `SSL certificates not found at ${keyPath} and/or ${certPath}. ` +
        `Running in HTTP mode. Set USE_HTTPS=false to suppress this warning.`
      );
    }
  } else {
    console.log('HTTPS disabled by configuration. Running in HTTP mode.');
  }
  
  return serverConfig;
}
