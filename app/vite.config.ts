import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*'],
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
        navigateFallback: '/index.html',
        runtimeCaching: [
          { urlPattern: /\/api\//, handler: 'NetworkFirst', options: { cacheName: 'api' } }
        ]
      }
    })
  ],
  server: { 
    port: 5174,
    host: '0.0.0.0', // Allow external access
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
});
