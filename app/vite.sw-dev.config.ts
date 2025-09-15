// vite.sw-dev.config.ts
// This config adds the Service-Worker-Allowed header to fix SW registration issues

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
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      strategies: 'generateSW',
      filename: 'sw.js',
      selfDestroying: false,
      base: base,
      scope: base,
      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        type: 'module'
      },
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'sw-skip-waiting.js'],
    })
  ],
  server: {
    https: {
      key: fs.readFileSync('localhost+3-key.pem'),
      cert: fs.readFileSync('localhost+3.pem'),
    },
    headers: {
      // This header allows the service worker from /dev-dist/ to control pages at root
      'Service-Worker-Allowed': '/'
    }
  }
});