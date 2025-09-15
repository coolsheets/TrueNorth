#!/bin/bash

# Service Worker Connection Troubleshooter Script
# This script helps diagnose and fix common service worker database connection issues

echo "========================================"
echo "Service Worker Database Connection Troubleshooter"
echo "========================================"
echo ""

# Check for required files
if [ ! -f "localhost+3-key.pem" ] || [ ! -f "localhost+3.pem" ]; then
  echo "❌ SSL certificates not found!"
  echo "   Service Workers require HTTPS on non-localhost domains"
  echo "   Run the generate-certs.sh script in scripts/ directory first"
  echo ""
  exit 1
fi

# Check if running on HTTPS
echo "Checking environment..."
echo ""

# Check if dev-dist/sw.js exists
if [ -f "dev-dist/sw.js" ]; then
  echo "✅ Service Worker found at dev-dist/sw.js"
  
  # Check for Service Worker path scope mismatch
  echo "   Checking for path scope issues..."
  if grep -q "scope: '.'" src/registerSW.ts || grep -q "scope: '/'" src/registerSW.ts; then
    echo "   ⚠️  Potential scope mismatch detected in registerSW.ts"
    echo "      The service worker script is in dev-dist/ but scope is set to root"
    echo "      This requires the Service-Worker-Allowed header to be set"
  fi
  echo ""
else
  echo "❌ Service Worker not found at dev-dist/sw.js"
  echo "   Run 'npm run dev' to generate the development service worker"
  echo ""
fi

# Check for IndexedDB access
echo "Checking IndexedDB access..."
if [ -f "public/manage-db.html" ]; then
  echo "✅ Database management page found at public/manage-db.html"
  echo "   You can use this page to verify database connection"
  echo ""
else
  echo "❌ Database management page not found"
  echo ""
fi

echo "Recommended Actions:"
echo "1. Run the fix-service-worker.sh script to add proper headers"
echo "2. Access the app via https://localhost:3000 when using the script"
echo "3. Use Chrome DevTools (Application tab) to verify Service Worker registration"
echo "4. Check Console for any connection errors"
echo ""
echo "For detailed troubleshooting, check docs/TROUBLESHOOTING_SERVICE_WORKERS.md"
echo "========================================"