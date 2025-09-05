#!/bin/bash

# Check Vite version and service worker compatibility

echo "===== PWA Environment Check ====="
echo ""

# Check Node.js version
echo "Node.js version:"
node -v

# Check NPM version
echo "NPM version:"
npm -v

# Check Vite version
echo ""
echo "Vite version:"
cd app && npx vite --version

# Check browser compatibility
echo ""
echo "Browser compatibility requirements for PWAs:"
echo "- Chrome/Chromium 64+ (recommended)"
echo "- Firefox 63+"
echo "- Safari 11.1+"
echo "- Edge 79+"
echo ""
echo "Service Workers require HTTPS except on localhost"
echo ""

# Check SSL certificates
echo "SSL certificate status:"
if [ -f "./app/cert.pem" ] && [ -f "./app/key.pem" ]; then
  echo "✓ SSL certificates are present in the app directory"
  echo "  - cert.pem: $(stat -c "%y" ./app/cert.pem)"
  echo "  - key.pem: $(stat -c "%y" ./app/key.pem)"
else
  echo "✗ SSL certificates are missing in the app directory"
  if [ -f "./cert.pem" ] && [ -f "./key.pem" ]; then
    echo "  But found in root directory. Need to be moved to app directory."
    echo "  Run: cp cert.pem key.pem app/"
  else
    echo "  Run ./scripts/generate-certs.sh to create them"
  fi
fi

echo ""
echo "To test the PWA with HTTPS, run:"
echo "  cd app && npm run dev:https"
echo ""
echo "To access from other devices on your network:"
echo "  cd app && npm run dev:mobile:https"
