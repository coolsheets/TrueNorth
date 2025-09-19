// sw-admin-utils.js
// Lightweight admin helper: unregister any active service worker and clear caches
// Intended to be included only on admin/manage pages to recover from stale SW/cache
(async function(){
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      if (regs && regs.length) {
        console.log('sw-admin-utils: unregistering service workers', regs);
        for (const r of regs) {
          try { await r.unregister(); console.log('sw-admin-utils: unregistered', r); } catch(e){ console.warn('sw-admin-utils: unregister failed', e); }
        }
      }
    }

    if ('caches' in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        try { await caches.delete(key); console.log('sw-admin-utils: deleted cache', key); } catch(e){ /* ignore */ }
      }
    }

    // Small delay to ensure resources are not in-use, then reload to fetch fresh assets
    setTimeout(() => {
      try { window.location.reload(); } catch(e) { /* ignore */ }
    }, 250);
  } catch (err) {
    console.error('sw-admin-utils error', err);
  }
})();
