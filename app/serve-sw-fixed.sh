#!/bin/bash

# Kill any existing server processes
pkill -f "vite preview" || true
pkill -f "npx serve" || true
pkill -f "node dist/server.js" || true

# Navigate to app directory
cd "$(dirname "$0")"

# Make sure the .env file has the correct API URL
echo "# App
VITE_API_BASE=http://localhost:8080" > .env

echo "Updated .env file to use API port 8080"
cat .env

# Build the app with the updated environment variable
VITE_API_BASE=http://localhost:8080 npm run build

# Start the API server in the background
echo "Starting API server on port 8080..."
cd ../server && PORT=8080 npm start &
API_SERVER_PID=$!

# Wait for API server to start
sleep 3
echo "API server started with PID: $API_SERVER_PID"

# Return to app directory
cd ../app

# Install proxy dependencies if needed
if ! npm list http-proxy-middleware &>/dev/null; then
  echo "Installing proxy dependencies..."
  npm install --no-save express http-proxy-middleware
fi

# Start the port forwarding proxy
echo "Starting port forwarding proxy 8082 -> 8080..."
node port-proxy.js &
PROXY_PID=$!
sleep 2

# Add explicit mime-type configuration for the service worker
echo "Setting up service worker with proper MIME type..."

# Directly use vite's preview server with custom MIME types
cat > vite.preview.config.js <<EOL
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
  }
});
EOL

# Use the vite preview command with our custom plugin
echo "Starting vite preview with service worker support..."
NODE_ENV=production VITE_SW_MIME_FIX=true npx vite preview --config vite.preview.config.js

# When the preview server is terminated, also kill the API server and proxy
trap 'echo "Shutting down servers..."; kill $API_SERVER_PID $PROXY_PID 2>/dev/null; exit 0' SIGINT SIGTERM
