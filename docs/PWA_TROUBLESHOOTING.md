# PWA Troubleshooting Guide

This document provides steps to diagnose and fix common PWA installation and service worker issues.

## PWA Installation Issues

### Missing Icons
If you're seeing "Missing required icons (192px+)" despite having the correct icon files:

1. **Check icon file paths**: Ensure icon paths in `manifest.webmanifest` start with `/` (e.g., `/icons/icon-192.png`)
2. **Verify icon dimensions**: Icons must be exactly 192x192px and 512x512px
3. **Add `purpose` attribute**: Make sure icons have `"purpose": "any maskable"` in the manifest
4. **Check icon accessibility**: Ensure icons are properly served from the server
5. **Use absolute paths with base**: In production, update paths to include base path (e.g., `/TrueNorth/icons/icon-192.png`)

### MIME Type Issues

If you're seeing errors like "Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of..." or "Manifest: Syntax error":

1. **Use a proper static file server**: Ensure your server is configured to serve the correct MIME types
2. **Update Content-Type headers**:
   - JavaScript files: `application/javascript; charset=utf-8`
   - Manifest files: `application/manifest+json; charset=utf-8`
   - CSS files: `text/css; charset=utf-8`
3. **Use serve.json with serve**: Create a `serve.json` configuration file for the `serve` package
4. **Use the serve-with-mime.sh script**: This script is configured to serve files with proper MIME types

### Service Worker Navigation Issues

If you're seeing "non-precached-url" errors:

1. **Update navigateFallback**: Ensure `navigateFallback` in Vite config points to the correct path depending on environment
2. **Add navigateFallbackDenylist**: Add patterns like `/^\/api\//` to exclude API routes from fallback
3. **Check base path**: Make sure `base` in Vite config matches the deployment path
4. **Update registerSW.ts**: Make sure service worker registration uses the correct path and scope

## Complete PWA Reset

To completely reset the PWA:

1. Run the reset script: `~/Documents/Projects/TrueNorth/scripts/reset-pwa.sh`
2. Follow the prompts to unregister service workers and clear caches
3. Test the PWA in a fresh browser window

## Development vs Production Testing

### Development Testing
```bash
# Start development server with PWA support
cd ~/Documents/Projects/TrueNorth/app
npm run dev
```

### Production Testing
```bash
# Build for production
cd ~/Documents/Projects/TrueNorth/app
APP_ENV=production npm run build

# Serve the production build
cd ~/Documents/Projects/TrueNorth/app
npx serve -s dist
```

## Service Worker Database Connection Issues

If your service worker can't connect to the IndexedDB database:

1. **Check for scope errors**: The most common error looks like:
   ```
   Failed to register a ServiceWorker for scope ('https://localhost:3000/') 
   with script ('https://localhost:3000/dev-dist/sw.js'). 
   The path of the provided scope ('/') is not under the max scope allowed ('/dev-dist/')
   ```

2. **Use the fix script**:
   ```bash
   cd ~/Documents/Projects/TrueNorth/app
   ./fix-service-worker.sh
   ```
   This script sets up a server with the proper `Service-Worker-Allowed` header.

3. **Access the troubleshooting documentation**:
   - See [SERVICE_WORKER_DB_CONNECTION_FIX.md](./SERVICE_WORKER_DB_CONNECTION_FIX.md) for detailed fix instructions
   - See [SERVICE_WORKER_QUICK_REF.md](./SERVICE_WORKER_QUICK_REF.md) for a quick reference guide

4. **Run the diagnostic tool**:
   ```bash
   cd ~/Documents/Projects/TrueNorth/app
   ./troubleshoot-sw-db.sh
   ```

## PWA Configuration Checklist

- [ ] `manifest.webmanifest` has correct icon paths and start_url
- [ ] `vite.config.ts` has correct base path based on environment
- [ ] `registerSW.ts` correctly handles service worker registration
- [ ] Icons are available in the correct size and format
- [ ] Service worker navigateFallback and caching strategies are correctly configured
- [ ] HTTPS is properly set up for local development
- [ ] Service worker has proper scope permissions (use fix-service-worker.sh for dev)

## Manual Browser Cleanup

If automatic cleanup doesn't work:

1. Open Chrome DevTools (F12)
2. Go to Application tab
3. Select "Service Workers" in the left sidebar
4. Click "Unregister" for any listed service workers
5. Select "Clear storage" in the left sidebar
6. Check all options and click "Clear site data"
7. Go to "Cache Storage" in the left sidebar and delete all caches
8. Go to "IndexedDB" in the left sidebar and delete all databases
