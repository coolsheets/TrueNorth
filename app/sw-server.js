// ESM server for fixing Service Worker scope issues
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import https from 'https';

// ES Module fixes for __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// SSL certificates for HTTPS
const options = {
  key: fs.readFileSync('localhost+3-key.pem'),
  cert: fs.readFileSync('localhost+3.pem')
};

// Serve static files from the current directory
app.use(express.static('.', {
  setHeaders: (res, filePath) => {
    // Add Service-Worker-Allowed header for the service worker
    if (filePath.endsWith('sw.js') && filePath.includes('dev-dist')) {
      console.log('Setting Service-Worker-Allowed header for:', filePath);
      res.set('Service-Worker-Allowed', '/');
    }
    
    // Set appropriate MIME types for common file extensions
    if (filePath.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.set('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.html')) {
      res.set('Content-Type', 'text/html; charset=utf-8');
    } else if (filePath.endsWith('.json') || filePath.endsWith('.webmanifest')) {
      res.set('Content-Type', 'application/manifest+json; charset=utf-8');
    } else if (filePath.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    } else if (filePath.endsWith('.svg')) {
      res.set('Content-Type', 'image/svg+xml');
    }
  }
}));

// Add a catchall route for SPA navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start HTTPS server
const PORT = 3000;
https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS Server running on https://localhost:${PORT}`);
  console.log('Service Worker will now be properly registered with correct scope');
  console.log('Press Ctrl+C to stop');
});
