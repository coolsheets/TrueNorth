// src/utils/offlineDetection.ts

/**
 * Enhanced offline detection with fallback strategy
 * This handles cases where navigator.onLine may not be reliable
 */

// Configuration constants
/**
 * Time in milliseconds that a connection failure is considered relevant
 * If a connection failure happened within this time window, we consider the device still offline
 */
const CONNECTION_FAILURE_TIMEOUT_MS = 30000; // 30 seconds

// Use any for now to avoid type conflicts with RequestInit
type FetchRequest = RequestInfo | URL;
type FetchOptions = any;

/**
 * Detects if the application is running in PWA mode
 * @returns boolean indicating if the app is in PWA mode
 */
export function isPWAMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.matchMedia('(display-mode: fullscreen)').matches ||
         document.referrer.includes('android-app://');
}

export function isBrowserOnline(): boolean {
  // Primary check - navigator.onLine
  if (!navigator.onLine) {
    return false;
  }
  
  // If we're online according to navigator, let's be cautious and 
  // rely on additional heuristics when in PWA/standalone mode
  if (isPWAMode()) {
    // Additional check - check if we have a connection type
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
                      
    if (connection && connection.type === 'none') {
      return false;
    }
    
    // If a recent fetch failed, consider us offline
    const lastConnFailTime = localStorage.getItem('lastConnectionFailure');
    if (lastConnFailTime) {
      const failedTimeAgo = Date.now() - parseInt(lastConnFailTime, 10);
      // If there was a failure within the timeout window, assume still offline
      if (failedTimeAgo < CONNECTION_FAILURE_TIMEOUT_MS) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Register a connection failure
 */
export function registerConnectionFailure(): void {
  localStorage.setItem('lastConnectionFailure', Date.now().toString());
}

/**
 * Clear any registered connection failures
 */
export function clearConnectionFailure(): void {
  localStorage.removeItem('lastConnectionFailure');
}

/**
 * Set up listeners to track online/offline status
 */
export function setupOfflineListeners(): void {
  window.addEventListener('online', () => {
    clearConnectionFailure();
  });

  window.addEventListener('offline', () => {
    registerConnectionFailure();
  });

  // Also catch fetch errors to detect when we're actually offline
  const originalFetch = window.fetch;
  window.fetch = async (input: FetchRequest, init?: FetchOptions) => {
    try {
      const response = await originalFetch(input, init);
      if (response.ok) {
        clearConnectionFailure();
      }
      return response;
    } catch (error) {
      registerConnectionFailure();
      throw error;
    }
  };
}
