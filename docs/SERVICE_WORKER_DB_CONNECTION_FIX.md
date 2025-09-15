# Service Worker Database Connection Fix

This document explains how to fix the service worker connection to the database in the TrueNorth PWA.

## The Problem

The error you're experiencing is:
```
Error: SecurityError
Failed to register a ServiceWorker for scope ('https://localhost:3000/') with script ('https://localhost:3000/dev-dist/sw.js'). The path of the provided scope ('/') is not under the max scope allowed ('/dev-dist/'). Adjust the scope, move the Service Worker script, or use the Service-Worker-Allowed HTTP header to allow the scope.
```

This is preventing the service worker from properly registering and connecting to the IndexedDB database.

## Root Cause

The issue occurs because:

1. In development mode, your service worker is located at `dev-dist/sw.js`
2. You're trying to register it with a scope of `/` (root)
3. Browsers enforce a security restriction that prevents a service worker from controlling pages outside its own directory

## Solutions

### Option 1: Use the Fix Script (Recommended)

The `fix-service-worker.sh` script creates an Express server that correctly sets the `Service-Worker-Allowed` header:

```bash
# Run from the app directory
cd app
./fix-service-worker.sh
```

Then access your app at https://localhost:3000

### Option 2: Manual Configuration in Existing Server

If you're using your own development server, add the `Service-Worker-Allowed` header:

For Express:
```javascript
app.use('/dev-dist/sw.js', (req, res, next) => {
  res.setHeader('Service-Worker-Allowed', '/');
  next();
});
```

For Vite:
```javascript
// vite.config.ts
export default defineConfig({
  server: {
    https: true,
    headers: {
      'Service-Worker-Allowed': '/',
    }
  }
});
```

## Diagnosing Issues

Use the troubleshooting script to diagnose service worker issues:

```bash
# Run from the app directory
cd app
./troubleshoot-sw-db.sh
```

This script will check for common service worker issues and provide recommendations.

## Verifying the Fix

1. After applying a fix, open Chrome DevTools (F12)
2. Go to the Application tab
3. Select "Service Workers" in the left sidebar
4. Verify that your service worker is registered with the correct scope
5. Check that the database connection works in your app

## Additional Resources

For more information, refer to:
- [docs/TROUBLESHOOTING_SERVICE_WORKERS.md](/docs/TROUBLESHOOTING_SERVICE_WORKERS.md)
- [docs/PWA_TROUBLESHOOTING.md](/docs/PWA_TROUBLESHOOTING.md)