// src/registerSW.ts
import { registerSW } from 'virtual:pwa-register';

// Register the service worker
const updateSW = registerSW({
  // When a new service worker is available and takes control, reload the page
  onNeedRefresh() {
    if (confirm('New content available. Reload to update?')) {
      updateSW(true);
    }
  },
  // When offline mode is ready
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  // Immediate registration
  immediate: true
});

export { updateSW };
