# Troubleshooting Service Worker Issues

This document provides guidance for resolving service worker issues with your PWA in various browsers.

## Common Service Worker Requirements

For service workers to function properly:

1. **HTTPS Required**: Service workers only work over HTTPS (except on localhost)
2. **Compatible Browser**: The browser must support Service Workers
3. **Permissions**: Browser settings must allow service workers
4. **Private/Incognito Mode**: Some browsers disable service workers in private browsing

## For Chromium/Chrome:

If service workers are not supported in Chromium/Chrome:

1. **Check chrome://flags**:
   - Navigate to `chrome://flags/#service-worker`
   - Ensure Service Workers are enabled

2. **Check site settings**:
   - Go to `chrome://settings/content/siteDetails?site=` followed by your site's URL
   - Ensure JavaScript is allowed
   - Check that service workers are not blocked

3. **Check extensions**:
   - Some privacy/ad-blocking extensions might interfere with service workers
   - Try disabling extensions temporarily

4. **Clear browser data**:
   - Go to `chrome://settings/clearBrowserData`
   - Clear site data and cache

## For Firefox:

1. **Check about:config**:
   - Navigate to `about:config`
   - Search for `dom.serviceWorkers.enabled`
   - Ensure it's set to `true`

2. **Private Browsing Mode**:
   - Check if you're in private browsing mode, where service workers might be disabled
   - To allow service workers in private browsing, set `dom.serviceWorkers.enabled.privateBrowsing` to `true`

## For Android Browsers:

1. **Check for OS restrictions**:
   - Some Android devices restrict background processes
   - Check battery optimization settings for your browser
   - Ensure the browser has proper permissions

2. **Use Chrome for Android**:
   - Chrome for Android has the best PWA support
   - Ensure you're using the latest version

## Testing a Local Dev Server with HTTPS

To test locally with HTTPS (which is required for service workers):

1. **Generate SSL certificates**:
   ```
   openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj '/CN=localhost'
   ```

2. **Move certificates** to your app directory:
   ```
   mv key.pem cert.pem /path/to/your/app/directory/
   ```

3. **Run the dev server** with HTTPS:
   ```
   npm run dev
   ```

4. **Accept the self-signed certificate** in your browser:
   - Visit your local development URL
   - You'll see a security warning
   - Click "Advanced" and proceed to the site

5. **Verify service worker registration** in the browser console:
   - Open dev tools and check the console for service worker registration messages
   - Look for "Service worker has been registered" message

## Using Chrome DevTools for PWA Development

1. **Application tab**:
   - Open Chrome DevTools > Application
   - Navigate to "Service Workers" section
   - You should see your registered service worker

2. **Lighthouse**:
   - Run a Lighthouse audit for PWA
   - Address any issues found in the report

3. **Network conditions**:
   - In DevTools, go to Network tab
   - Check "Offline" to simulate offline mode
   - Refresh the page to test offline functionality
