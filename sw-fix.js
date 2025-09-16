// This is a minimal service worker that fixes the "Cannot read properties of undefined (reading 'https')" error

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fix for TypeError: Cannot read properties of undefined (reading 'https')
self.addEventListener('fetch', (event) => {
  // This is a simple pass-through fetch handler
  // It prevents the error by ensuring there's always a fetch handler registered
  event.respondWith(
    fetch(event.request).catch((error) => {
      console.error('Fetch error:', error);
      return new Response('Network error', { status: 500 });
    })
  );
});