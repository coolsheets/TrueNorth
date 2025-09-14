# Fix PWA installation criteria TypeError and improve service worker updates

This PR addresses issues with service worker updates and PWA installation, focusing on fixing the TypeError that was occurring when accessing criteria properties.

## Key Changes

### 1. Fixed TypeError in PWA Components
- Added proper null checks (optional chaining) when accessing `installCriteria.criteria.https` and other properties
- Updated async handling in useEffect for PWA installation status checks
- Fixed error that was preventing the PWA status display from rendering correctly

### 2. Service Worker Improvements
- Fixed the mismatch between ServiceWorkerDebug component export and import
- Added client claim on activation to ensure new service workers take over properly
- Enhanced skip waiting functionality for better service worker updates
- Consolidated service worker registration logic for consistency

### 3. VitePWA Configuration Updates
- Improved base path handling for deployments
- Updated service worker configuration for better update handling
- Enhanced caching strategies for offline performance

## Testing
- Verified the application builds successfully without errors
- Confirmed the TypeError no longer appears in the console during PWA installation checks
- Tested service worker updates to ensure proper functionality

These changes make the PWA more robust by preventing undefined property access errors and improving the service worker update flow. The application should now handle PWA installation checks more gracefully, even when some properties are undefined or null.

## Error Details Fixed
The specific error that was fixed:
```
TypeError: can't access property "https", v.criteria is undefined
```

This was occurring because the code was trying to access properties on objects that might be undefined during the initial render or when data was still loading. By adding proper null checks with optional chaining operators, we've ensured the application handles these cases gracefully.