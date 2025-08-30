# Testing PWA Offline Functionality

This guide provides instructions for testing the offline functionality of the PPI Canada PWA.

## Prerequisites

- A mobile device or a desktop browser with PWA installation capabilities
- Access to the application (either deployed or running locally)

## Installation Steps

### On Mobile Device

1. Open the application in a mobile browser (Chrome, Safari, etc.)
2. Navigate through the app to trigger caching of important routes
3. Add the app to your home screen:
   - **iOS**: Tap the share button and select "Add to Home Screen"
   - **Android**: Tap the menu button and select "Add to Home Screen" or "Install App"
4. Launch the app from the home screen icon to verify it loads in standalone mode

### On Desktop

1. Open the application in Chrome
2. Click the install icon in the address bar or use the menu to install
3. Launch the installed app from your desktop

## Testing Offline Functionality

### Method 1: Airplane Mode

1. Start the app from your home screen
2. Create a new inspection and add some data
3. Enable Airplane mode or turn off Wi-Fi and cellular data
4. Continue using the app - you should be able to:
   - Navigate between pages
   - Enter and save inspection data
   - See the "Offline" indicator at the top of the screen
5. Disable Airplane mode to restore connectivity
6. Verify that the app syncs your offline changes (watch for the sync indicator)

### Method 2: DevTools Network Simulation

For desktop testing with Chrome DevTools:

1. Open the installed PWA
2. Open DevTools (F12 or right-click and select "Inspect")
3. Go to the Network tab
4. Check "Offline" to simulate offline mode
5. Use the app to verify offline functionality
6. Uncheck "Offline" to restore connectivity and verify sync

## Troubleshooting Offline Issues

If offline functionality doesn't work correctly:

1. **Clear Cache**: Clear your browser cache and PWA data:
   - On Chrome, go to Settings > Apps > PPI Canada > Clear & Reset
   - On iOS, you may need to delete and reinstall the app

2. **Check for Updates**: Make sure you're using the latest version of the app
   - The app should prompt for updates if available
   - If not, try uninstalling and reinstalling

3. **Verify Service Worker**: In Chrome DevTools (desktop):
   - Go to Application > Service Workers
   - Verify that the service worker is active and running
   - Try clicking "Update" or "Unregister" and then reload

4. **IndexedDB Data**: Check if data is being stored:
   - In Chrome DevTools, go to Application > IndexedDB > ppi-canada
   - Verify that your data is stored in the "drafts" object store

## Expected Behavior

- The app should display an offline indicator when no connection is available
- All pages should load, even without a network connection
- Data entered while offline should be stored locally
- When coming back online, the app should automatically sync local changes
- A sync status indicator should appear during and after synchronization
