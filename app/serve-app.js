import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4173;

// Set MIME types explicitly
app.use('*.js', (req, res, next) => {
  res.set('Content-Type', 'application/javascript; charset=utf-8');
  next();
});

app.use('*.mjs', (req, res, next) => {
  res.set('Content-Type', 'application/javascript; charset=utf-8');
  next();
});

app.use('*.css', (req, res, next) => {
  res.set('Content-Type', 'text/css; charset=utf-8');
  next();
});

app.use('*.webmanifest', (req, res, next) => {
  res.set('Content-Type', 'application/manifest+json; charset=utf-8');
  next();
});

app.use('*.json', (req, res, next) => {
  res.set('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use('*.html', (req, res, next) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  next();
});

app.use('*.png', (req, res, next) => {
  res.set('Content-Type', 'image/png');
  next();
});

app.use('*.jpg', (req, res, next) => {
  res.set('Content-Type', 'image/jpeg');
  next();
});

app.use('*.svg', (req, res, next) => {
  res.set('Content-Type', 'image/svg+xml');
  next();
});

// For service worker
app.use('/sw.js', (req, res, next) => {
  res.set('Content-Type', 'application/javascript; charset=utf-8');
  res.set('Cache-Control', 'no-cache');
  res.set('Service-Worker-Allowed', '/');
  next();
});

// Fix manifest
const manifestPath = path.join(__dirname, 'dist/manifest.webmanifest');
if (fs.existsSync(manifestPath)) {
  try {
    // Ensure manifest is valid JSON
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    // Try to parse it
    JSON.parse(manifestContent);
  } catch (error) {
    // If not valid JSON, create a basic valid one
    console.log('Creating valid manifest.webmanifest');
    const validManifest = {
      name: "TrueNorth Inspection App",
      short_name: "TrueNorth",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#1976d2",
      icons: [
        {
          src: "/icons/icon-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/icons/icon-512x512.png", 
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };
    fs.writeFileSync(manifestPath, JSON.stringify(validManifest, null, 2), 'utf8');
    
    // Also create manifest.json for compatibility
    fs.writeFileSync(path.join(__dirname, 'dist/manifest.json'), 
      JSON.stringify(validManifest, null, 2), 'utf8');
  }
}

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing - redirect all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`PWA server running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});