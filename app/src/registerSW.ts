// Register service worker for PWA functionality

/**
 * Registers a service worker and sets up update handling
 * @param onUpdate Callback to be called when a new service worker is available
 * @returns Promise that resolves when registration is complete
 */
export function wireServiceWorker(onUpdate: () => void): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported in this browser');
      reject(new Error('Service Worker not supported'));
      return;
    }

    try {
      const base = import.meta.env.BASE_URL || '/';
      // Ensure the URL is constructed correctly
      const swPath = import.meta.env.DEV ? 'dev-dist/sw.js' : 'sw.js';
      
      // Debug URL construction
      console.log('SW Path:', swPath);
      console.log('Origin:', window.location.origin);
      
      navigator.serviceWorker.register(swPath, { scope: base })
        .then(reg => {
          console.log('Service Worker registered successfully:', reg);
          console.log('Service Worker scope:', reg.scope);
          
          if (reg.active) {
            console.log('Service Worker is active');
          }
          
          const listen = (worker?: ServiceWorker | null) => {
            if (!worker) return;
            worker.addEventListener('statechange', () => {
              console.log('Service Worker state changed to:', worker.state);
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New Service Worker installed and controlling');
                onUpdate();
              }
            });
          };

          listen(reg.installing);
          reg.addEventListener('updatefound', () => {
            console.log('Service Worker update found');
            listen(reg.installing);
          });

          // cross‑tab notify
          window.addEventListener('storage', (e) => {
            if (e.key === 'sw-update-available') {
              console.log('Service Worker update detected from another tab');
              onUpdate();
            }
          });
          
          // debounce reload on activation
          let reloaded = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service Worker controller changed');
            if (!reloaded) { 
              reloaded = true; 
              console.log('Reloading page due to Service Worker update');
              location.reload(); 
            }
          });
          
          resolve();
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
          reject(error);
        });
    } catch (err) {
      console.error('Error during Service Worker setup:', err);
      reject(err);
    }
  });
}

/**
 * Applies a service worker update by sending the SKIP_WAITING message
 */
export async function applyUpdate(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    
    if (!reg) {
      console.warn('No service worker registration found to update');
      return;
    }
    
    const waiting = reg.waiting;
    if (waiting) {
      console.log('Sending SKIP_WAITING message to waiting service worker');
      waiting.postMessage({ type: 'SKIP_WAITING' });
      localStorage.setItem('sw-update-available', String(Date.now()));
    } else {
      console.log('No waiting service worker found to update');
    }
  } catch (error) {
    console.error('Error applying service worker update:', error);
  }
}

// Define type for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

// Add logic to handle installation prompt
let deferredPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Store the event so it can be triggered later
  deferredPrompt = e as BeforeInstallPromptEvent;
  // Optionally, show your own install button or UI element
  console.log('PWA is installable');
});

/**
 * Shows the installation prompt if available
 */
export function showInstallPrompt(): void {
  if (!deferredPrompt) {
    console.log('Installation prompt not available');
    return;
  }
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the installation');
    } else {
      console.log('User dismissed the installation');
    }
    // Clear the deferredPrompt variable
    deferredPrompt = null;
  }).catch((error: Error) => {
    console.error('Error during installation prompt:', error);
  });
}