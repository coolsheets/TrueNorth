#!/bin/bash

# Comprehensive script to diagnose and help fix PWA SSL certificate issues
# Usage: ./scripts/pwa-ssl-troubleshooter.sh

echo "===== PWA SSL Certificate Troubleshooter ====="
echo ""

# Check if we're running on localhost
if [[ $HOSTNAME == "localhost" || $HOSTNAME == "127.0.0.1" ]]; then
  echo "✅ Running on localhost - Service Workers are exempt from SSL requirements here"
else
  echo "🔍 Not running on localhost - Will need proper SSL certificates"
fi

# Check if mkcert is installed
if command -v mkcert &> /dev/null; then
  echo "✅ mkcert is installed"
  
  # Check if mkcert has a valid CA
  if mkcert -CAROOT &> /dev/null; then
    echo "✅ mkcert CA is installed at: $(mkcert -CAROOT)"
  else
    echo "❌ mkcert CA is not installed. Run: mkcert -install"
  fi
else
  echo "❌ mkcert is not installed"
  echo "   Recommendation: Install mkcert for easy local certificate management"
  echo "   Ubuntu/Debian: sudo apt install mkcert"
  echo "   macOS: brew install mkcert"
fi

# Check if our certificate files exist
if [[ -f "./app/cert.pem" && -f "./app/key.pem" ]]; then
  echo "✅ Certificate files exist (app/cert.pem and app/key.pem)"
  
  # Check certificate expiration
  EXPIRY=$(openssl x509 -enddate -noout -in ./app/cert.pem | cut -d= -f2)
  echo "   Certificate expires: $EXPIRY"
  
  # Check certificate domains/IPs
  echo "   Certificate covers these domains/IPs:"
  openssl x509 -in ./app/cert.pem -noout -text | grep -A1 "Subject Alternative Name" | tail -n1 | sed 's/DNS://g; s/, /\n   - /g; s/^/   - /'
else
  echo "❌ Certificate files not found in app directory"
  echo "   Recommendation: Generate certificates with mkcert:"
  echo "   mkcert -install"
  echo "   mkcert localhost 127.0.0.1 $(hostname -I | awk '{print $1}')"
  echo "   cp localhost+*.pem app/cert.pem"
  echo "   cp localhost+*-key.pem app/key.pem"
fi

# Check vite config
if grep -q "https:" ./app/vite.config.ts; then
  echo "✅ Vite config has HTTPS settings"
else
  echo "❌ Vite config doesn't have HTTPS settings"
  echo "   Recommendation: Add https configuration to app/vite.config.ts:"
  echo "   import fs from 'fs';"
  echo "   // In defineConfig:"
  echo "   server: {"
  echo "     https: {"
  echo "       key: fs.readFileSync('./app/key.pem'),"
  echo "       cert: fs.readFileSync('./app/cert.pem'),"
  echo "     },"
  echo "   },"
fi

# Check service worker registration
if grep -q "serviceWorker" ./app/src/registerSW.ts; then
  echo "✅ Service Worker registration code found"
else
  echo "❌ No Service Worker registration code found"
fi

# Suggest next steps
echo ""
echo "===== Recommended Steps ====="
echo ""
echo "1. For local testing only: Use the localhost test script"
echo "   ./scripts/test-pwa-localhost.sh"
echo ""
echo "2. For network testing with other devices:"
echo "   a. Generate trusted certificates with mkcert (if not done already)"
echo "   b. Update vite.config.ts to use these certificates"
echo "   c. Start the app with: npm run dev"
echo "   d. Access via https://YOUR_IP:5173"
echo ""
echo "3. Install the PWA in Chrome by:"
echo "   a. Opening the app in Chrome"
echo "   b. Looking for the install icon in the address bar"
echo "   c. Or using the Force Installation Prompt button in the PWAStatus component"
echo ""
echo "For more detailed information, see: ./docs/SSL_CERTIFICATE_ISSUES.md"
