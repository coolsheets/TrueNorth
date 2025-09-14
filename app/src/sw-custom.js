// This file augments the generated service worker with custom functionality
// It will be inlined into the service worker by Workbox

// Listen for the SKIP_WAITING message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});