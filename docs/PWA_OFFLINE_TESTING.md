# PWA Offline Testing Guide

This document provides instructions for testing the offline capabilities of the PPI Canada PWA application.

## What Makes Our App a PWA?

1. **Service Worker**: Intercepts network requests and serves cached resources when offline
2. **Web App Manifest**: Enables "Add to Home Screen" functionality
3. **Responsive Design**: Works on all device sizes
4. **Offline Data Storage**: Using IndexedDB for inspection data

## Testing Offline Functionality

### Method 1: Using Chrome DevTools

1. Open the application in Chrome
2. Open DevTools (F12 or Ctrl+Shift+I)
3. Go to the **Application** tab
4. Navigate to:
   - **Service Workers** section to verify registration
   - **Manifest** section to verify installability
   - **Cache Storage** to see cached resources
   - **IndexedDB** to see stored data
5. Use the **Network** tab and check "Offline" to simulate offline conditions

### Method 2: Physical Network Testing

1. Load the application completely while connected
2. Disconnect from the network (turn off Wi-Fi or enable airplane mode)
3. Refresh the page - it should still load from cache
4. Try performing the following actions while offline:
   - Navigate between pages
   - Fill out inspection forms
   - Review existing inspections
   - All functionality should work, with a notice that you're offline

### Method 3: Using the PWAStatus Component

We've added a `PWAStatus` component that can be accessed in development environments to check:
- Service Worker activation status
- Installation status
- Offline capability test
- Current network status

## Common Issues and Solutions

### App Doesn't Work Offline

1. **Service Worker Not Registered**: Check the console for registration errors
2. **Caching Strategy Issue**: Verify the service worker is caching the correct files
3. **Missing Resources**: Some required resources might not be included in the cache

### Can't Install the PWA

1. **Manifest Issues**: Ensure the manifest.webmanifest file is properly configured
2. **HTTPS Requirement**: PWAs must be served over HTTPS (except on localhost)
3. **Missing Icons**: Proper icons must be defined in the manifest

### Data Not Persisting Offline

1. **IndexedDB Issues**: Check the console for database errors
2. **Storage Quota**: Browser storage limits might be reached
3. **Synchronization Issues**: Data might not be properly syncing when returning online

## Deployment Considerations

When deploying updates to the PWA:

1. **Cache Versioning**: Update cache versions when deploying new code
2. **Service Worker Updates**: Users might need to refresh to get the latest version
3. **Backwards Compatibility**: Ensure data structures are compatible with previous versions

## Resources

- [MDN Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Chrome PWA Checklist](https://web.dev/pwa-checklist/)
