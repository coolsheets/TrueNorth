#!/bin/bash

# Kill any existing server processes
pkill -f "vite preview" || true
pkill -f "node dist/server.js" || true

# Build server code to apply any changes
echo "Building server code..."
cd "$(dirname "$0")/../server" && npm run build

echo "Starting API server on port 8080..."
npm start &
API_SERVER_PID=$!

# Wait for API server to start
sleep 2
echo "API server started with PID: $API_SERVER_PID"

# Return to app directory for frontend
cd "$(dirname "$0")"
echo "Building and serving frontend..."
npm run build && npm run preview

# Cleanup when process is terminated
trap 'echo "Shutting down servers..."; kill $API_SERVER_PID 2>/dev/null; exit 0' SIGINT SIGTERM
