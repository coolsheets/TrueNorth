#!/bin/bash

# Kill any existing server processes
pkill -f "vite preview" || true
pkill -f "node dist/server.js" || true

SERVER_DIR="/home/mfretwell/Documents/Projects/TrueNorth/server"
APP_DIR="/home/mfretwell/Documents/Projects/TrueNorth/app"

# Build server code to apply any changes
echo "Building server code..."
cd "$SERVER_DIR" && npm run build

echo "Starting API server on port 8080..."
cd "$SERVER_DIR" && npm start &
API_SERVER_PID=$!

# Wait for API server to start
sleep 2
echo "API server started with PID: $API_SERVER_PID"

# Build and serve frontend
cd "$APP_DIR"
echo "Building and serving frontend..."
npm run build && npm run preview

# Cleanup when process is terminated
trap 'echo "Shutting down servers..."; kill $API_SERVER_PID 2>/dev/null; exit 0' SIGINT SIGTERM
