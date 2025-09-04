#!/bin/bash

# Stop any running development servers
echo "Stopping any running development servers..."
pkill -f "vite"

# Clear browser caches for service workers
echo "To fully reset service workers, please:"
echo "1. Open Chrome DevTools"
echo "2. Go to Application tab"
echo "3. Select 'Service Workers' in the left sidebar"
echo "4. Click 'Unregister' for any listed service workers"
echo "5. Also check 'Clear storage' and click 'Clear site data'"
echo ""

# Remove any cached service worker files
echo "Cleaning generated service worker files..."
rm -rf app/dev-dist
rm -rf app/dist

# Start development server with proper environment
echo "Starting development server..."
cd app

# Run Vite in development mode
echo "Starting Vite with PWA support..."
npm run dev

echo "If service worker issues persist, try accessing via localhost instead of IP address."
