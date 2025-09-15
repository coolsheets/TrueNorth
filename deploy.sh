#!/bin/bash

# Complete TrueNorth Deployment Script
# Deploys both API server and PWA with proper configuration

# Stylized output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TrueNorth Complete Deployment ===${NC}"

# Get project root
PROJECT_ROOT="/home/mfretwell/Documents/Projects/TrueNorth"
SERVER_DIR="$PROJECT_ROOT/server"
APP_DIR="$PROJECT_ROOT/app"

# 1. Deploy API Server
echo -e "${YELLOW}Deploying API Server...${NC}"
cd "$SERVER_DIR" || { echo -e "${RED}Failed to find server directory${NC}"; exit 1; }

# Kill any existing server processes
echo -e "${YELLOW}Stopping any existing API server processes...${NC}"
pkill -f "node.*server/dist" || true

# Build the server
echo -e "${YELLOW}Building the API server...${NC}"
npm run build

# Start server in background
echo -e "${GREEN}Starting API server...${NC}"
npm start &
API_PID=$!

# Wait for API to start
sleep 2
echo -e "${GREEN}API available at http://localhost:8080 (PID: $API_PID)${NC}"

# 2. Deploy PWA
echo -e "${YELLOW}Deploying PWA...${NC}"
cd "$APP_DIR" || { echo -e "${RED}Failed to find app directory${NC}"; exit 1; }

# Kill any existing PWA server processes
echo -e "${YELLOW}Stopping any existing PWA server processes...${NC}"
pkill -f "vite preview" || true

# Build the application
echo -e "${YELLOW}Building the PWA...${NC}"
npm run build

# Create a Vite preview config to handle MIME types
echo -e "${YELLOW}Creating Vite preview config with proper MIME types...${NC}"
cat > vite.preview.config.js <<EOF
import { defineConfig } from 'vite';

export default defineConfig({
  preview: {
    port: 4173,
    strictPort: true,
    configure: (server) => {
      server.middlewares.use((req, res, next) => {
        if (req.url.endsWith('.js') || req.url.endsWith('.mjs')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
        if (req.url.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
        }
        if (req.url.endsWith('.webmanifest')) {
          res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
        }
        if (req.url === '/sw.js') {
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Service-Worker-Allowed', '/');
        }
        next();
      });
    },
  },
});
EOF

# Start PWA server
echo -e "${GREEN}Starting PWA server with proper MIME types...${NC}"
echo -e "${GREEN}PWA available at http://localhost:4173${NC}"
npx vite preview --config vite.preview.config.js

# When PWA server exits, also kill API server
echo -e "${YELLOW}Shutting down API server (PID: $API_PID)...${NC}"
kill $API_PID