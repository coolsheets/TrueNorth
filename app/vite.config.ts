import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*'],
      injectRegister: 'auto',  // Try auto registration instead
      strategies: 'generateSW', // Default strategy
      devOptions: {
        enabled: true,
        type: 'module'
      },
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          { urlPattern: /\/api\//, handler: 'NetworkFirst', options: { cacheName: 'api' } }
        ]
      }
    })
  ],
  server: { 
    port: 5173,
    https: {
      key: './key.pem',  // Path relative to app directory
      cert: './cert.pem' // Path relative to app directory
    }  // Use HTTPS for local development
  }
});
