# Testing the PWA Deployment

This guide helps you test the PWA deployment on GitHub Pages to verify offline functionality.

## Accessing the Deployment

The PWA is deployed and accessible at: [https://coolsheets.github.io/TrueNorth/](https://coolsheets.github.io/TrueNorth/)

For mobile testing, scan the QR code in the README.md file.

## Testing Offline Functionality

### Desktop Testing

1. **Initial Access**:
   - Open Chrome browser and navigate to https://coolsheets.github.io/TrueNorth/
   - Allow the page to fully load

2. **Service Worker Verification**:
   - Open Chrome DevTools (F12 or Ctrl+Shift+I)
   - Go to the Application tab
   - Select "Service Workers" in the left sidebar
   - Verify that a service worker is registered and active
   - If not active, refresh the page and check again

3. **Install the PWA**:
   - Look for the install icon in the address bar or three-dot menu
   - Click to install the PWA
   - Open the installed PWA from your desktop

4. **Offline Testing**:
   - In Chrome DevTools, go to the Network tab
   - Check the "Offline" checkbox to simulate being offline
   - Refresh the page - it should still load from cache
   - Navigate through different inspection pages
   - Try filling out forms and verifying the data persists

### Mobile Testing

1. **Scan the QR code** from the README.md to open the app on your mobile device

2. **Install the PWA** by:
   - On Android: Tap the "Add to Home Screen" prompt or use the Chrome menu
   - On iOS: Tap the share button, then "Add to Home Screen"

3. **Test Offline Mode**:
   - Enable airplane mode on your device
   - Open the installed PWA from your home screen
   - Verify that the app loads and functions correctly
   - Test form inputs and navigation between pages

## Troubleshooting

If you encounter issues:

1. **404 Errors**: 
   - Check that all resources are loading with the correct base path (/TrueNorth/)
   - Inspect the network requests in DevTools for any failed requests

2. **Service Worker Issues**:
   - Check the console for registration errors
   - Try clearing site data and cache, then reload

3. **PWA Not Installing**:
   - Make sure the site uses HTTPS
   - Verify the manifest.webmanifest is being loaded correctly

4. **Data Persistence Issues**:
   - Check IndexedDB in DevTools Application tab to verify data storage

## Reporting Issues

If you find issues with the PWA deployment, please create a GitHub issue with:
1. The specific problem you encountered
2. Steps to reproduce the issue
3. Device/browser information
4. Screenshots if applicable
