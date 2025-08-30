// src/utils/offlineDetection.ts

/**
 * Enhanced offline detection with fallback strategy
 * This handles cases where navigator.onLine may not be reliable
 */

export function isBrowserOnline(): boolean {
  // Primary check - navigator.onLine
  if (!navigator.onLine) {
    return false;
  }
  
  // If we're online according to navigator, let's be cautious and 
  // rely on additional heuristics when in PWA/standalone mode
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                window.matchMedia('(display-mode: fullscreen)').matches ||
                document.referrer.includes('android-app://');
  
  if (isPWA) {
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
      // If there was a failure within the last 30 seconds, assume still offline
      if (failedTimeAgo < 30000) {
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
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
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
