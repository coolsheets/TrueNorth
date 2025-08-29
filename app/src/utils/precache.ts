/**
 * Utility to pre-cache critical resources for better offline experience
 */

/**
 * Pre-caches the most important app routes to ensure they work offline
 */
export async function precacheRoutes(): Promise<void> {
  // Don't run if service workers aren't supported
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    console.log('Service worker not active, skipping route pre-caching');
    return;
  }

  try {
    // Routes to pre-cache for offline access
    const routesToCache = [
      '/',
      '/start',
      '/vehicle',
      '/exterior',
      '/interior',
      '/engine-bay',
      '/road-test',
      '/rust',
      '/post-drive',
      '/review',
      '/export'
    ];

    console.log('Pre-caching app routes for offline use...');
    
    // Fetch each route to ensure it's in the cache
    const fetchPromises = routesToCache.map(route => 
      fetch(route, { cache: 'reload', mode: 'no-cors' })
        .then(() => console.log(`Pre-cached: ${route}`))
        .catch(err => console.error(`Failed to pre-cache ${route}:`, err))
    );

    await Promise.all(fetchPromises);
    console.log('Route pre-caching complete');
  } catch (error) {
    console.error('Error pre-caching routes:', error);
  }
}

/**
 * Pre-caches key API resources (if any exist that should be available offline)
 */
export async function precacheApiResources(): Promise<void> {
  // Don't run if we're not online
  if (!navigator.onLine) {
    console.log('Device is offline, skipping API pre-caching');
    return;
  }

  try {
    // API endpoints to pre-cache
    const apiEndpoints = [
      '/api/health' // Just as a basic check that the API is up
    ];

    console.log('Pre-caching key API resources...');
    
    const fetchPromises = apiEndpoints.map(endpoint => 
      fetch(endpoint, { 
        cache: 'reload',
        headers: { 'Cache-Control': 'no-cache' }
      })
        .then(() => console.log(`Pre-cached API: ${endpoint}`))
        .catch(err => console.error(`Failed to pre-cache API ${endpoint}:`, err))
    );

    await Promise.all(fetchPromises);
    console.log('API pre-caching complete');
  } catch (error) {
    console.error('Error pre-caching API resources:', error);
  }
}

/**
 * Initialize all pre-caching
 */
export function initPrecaching(): void {
  // Run pre-caching after the app has fully loaded
  window.addEventListener('load', () => {
    // Delay pre-caching to avoid competing with initial page load
    setTimeout(() => {
      precacheRoutes();
      precacheApiResources();
    }, 5000); // 5-second delay
  });
}
