#!/bin/bash

# Service Worker Scope Fix Script
# ------------------------------
# This script fixes the Service Worker scope issue by adding proper headers
# allowing a service worker in dev-dist/ to control pages at the root (/)
#
# Usage:
#   ./fix-service-worker.sh
#
# After running, access your app at: https://localhost:3000
# 
# Requirements:
#  - SSL certificates must exist (localhost+3.pem and localhost+3-key.pem)
#  - Node.js must be installed
#  - Express will be installed if not already present

echo "========================================"
echo "Service Worker Scope Fix Script"
echo "========================================"
echo ""

# Check if SSL certificates exist
if [ ! -f "localhost+3-key.pem" ] || [ ! -f "localhost+3.pem" ]; then
  echo "❌ SSL certificates not found! Service Workers require HTTPS."
  echo "   Please run the scripts/generate-certs.sh script first."
  echo "   Or ensure your localhost+3.pem certificates are in this directory."
  exit 1
fi

# Check if we're in development mode (using dev-dist)
if [ -d "dev-dist" ]; then
  echo "✅ Development mode detected (dev-dist exists)"
  
  # Create an ESM Express server that serves the files with proper headers
  cat > sw-server.js <<EOL
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
  console.log(\`HTTPS Server running on https://localhost:\${PORT}\`);
  console.log('Service Worker will now be properly registered with correct scope');
  console.log('Press Ctrl+C to stop');
});
EOL

  # Create package.json for ESM
  cat > sw-server-package.json <<EOL
{
  "name": "sw-server",
  "version": "1.0.0",
  "description": "Service Worker scope fix server",
  "main": "sw-server.js",
  "type": "module",
  "private": true
}
EOL

  # Check if express is installed, install if not
  if ! npm list express &>/dev/null; then
    echo "Installing express for the server..."
    npm install --no-save express
  fi

  echo "Starting the fixed development server with proper Service-Worker-Allowed headers..."
  NODE_OPTIONS=--no-warnings node sw-server.js
else
  echo "Production mode detected (using fixed-serve-pwa.sh)"
  # For production builds, we can use the existing fixed-serve-pwa.sh script
  bash ./fixed-serve-pwa.sh
fi