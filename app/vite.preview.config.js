import { defineConfig } from 'vite';

export default defineConfig({
  preview: {
    port: 4173,
    open: true,
    cors: true,
    headers: {
      'Service-Worker-Allowed': '/',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    },
    proxy: {
      // Redirect any requests going to port 8082 to port 8080
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
