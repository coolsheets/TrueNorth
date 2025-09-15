#!/bin/bash

# PWA Deployment Script
# This script builds and serves the TrueNorth PWA with proper MIME types
# following project standards

# Stylized output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TrueNorth PWA Deployment ===${NC}"

# Kill any existing server processes
echo -e "${YELLOW}Stopping any existing server processes...${NC}"
pkill -f "vite preview" || true
pkill -f "node.*server.js" || true

# Build the application
echo -e "${YELLOW}Building the application...${NC}"
npm run build

# Create a Vite preview config to handle MIME types
echo -e "${YELLOW}Creating Vite preview config with proper MIME types...${NC}"
cat > vite.preview.config.js <<EOF
import { defineConfig } from 'vite';

export default defineConfig({
  preview: {
    port: 4173,
    strictPort: true,
    headers: {
      // Ensure correct MIME types for critical files
      '*.js': {
        'Content-Type': 'application/javascript; charset=utf-8'
      },
      '*.mjs': {
        'Content-Type': 'application/javascript; charset=utf-8'
      },
      '*.css': {
        'Content-Type': 'text/css; charset=utf-8'
      },
      '*.webmanifest': {
        'Content-Type': 'application/manifest+json; charset=utf-8'
      },
      // Service Worker specific headers
      '/sw.js': {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Service-Worker-Allowed': '/'
      },
      '/workbox-*.js': {
        'Content-Type': 'application/javascript; charset=utf-8'
      }
    }
  }
});
EOF

# Start server
echo -e "${GREEN}Starting PWA server with proper MIME types...${NC}"
echo -e "${GREEN}Access at http://localhost:4173${NC}"
npx vite preview --config vite.preview.config.js