// Advanced service worker functionality for the PWA

/**
 * This function sets up the necessary message handling for updating service workers
 * It ensures the skipWaiting message is handled properly
 */
export function setupServiceWorkerMessageHandling() {
  if (!navigator.serviceWorker) return;
  
  // Set up a message listener to handle SKIP_WAITING messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'RELOAD_PAGE') {
      window.location.reload();
    }
  });
  
  // Handle controllerchange events
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service Worker controller changed, reloading');
    // Reload the page when the new service worker takes control
    window.location.reload();
  });
}

/**
 * Send a SKIP_WAITING message to the waiting service worker
 * This tells the new service worker to activate immediately
 */
export async function sendSkipWaitingMessage() {
  if (!navigator.serviceWorker) return;
  
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;
  
  const waiting = registration.waiting;
  if (!waiting) return;
  
  // Send the SKIP_WAITING message to the waiting service worker
  waiting.postMessage({ type: 'SKIP_WAITING' });
  
  // Store a flag in localStorage for cross-tab notification
  localStorage.setItem('sw-update-available', Date.now().toString());
}