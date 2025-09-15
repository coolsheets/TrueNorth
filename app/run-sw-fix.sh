#!/bin/bash

# Very simple script to run Vite with Service-Worker-Allowed header
# This allows the service worker to access the database

echo "Starting Vite with Service-Worker-Allowed header..."
echo "This will fix the service worker database connection issue."
echo ""

# Run Vite with the special config
npx vite --config vite.sw-dev.config.ts