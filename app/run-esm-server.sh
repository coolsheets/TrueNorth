#!/bin/bash

# Kill any running server processes
echo "Stopping any running servers..."
pkill -f "node serve-app.js" || true

# Make sure we have the latest build
echo "Building the application..."
npm run build

# Install express if not already installed
if ! npm list express >/dev/null 2>&1; then
  echo "Installing express..."
  npm install express --no-save
fi

# Start the custom express server
echo "Starting ESM-compatible server with proper MIME types..."
node serve-app.js