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
      // Ensure the URL is constructed correctly - add base path for GitHub Pages
      const swPath = import.meta.env.DEV ? 'dev-dist/sw.js' : `${base}sw.js`;
      
      // Debug URL construction
      console.log('SW Path:', swPath);
      console.log('Base URL:', base);
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
              
              // Only trigger update notification if:
              // 1. Worker reached 'installed' state
              // 2. There's a controller (not first page load)
              // 3. The controller is different from this worker (this indicates an update, not initial install)
              if (worker.state === 'installed' && 
                  navigator.serviceWorker.controller && 
                  worker !== navigator.serviceWorker.controller) {
                console.log('New Service Worker update installed (not first install)');
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
 * 
 * This function attempts to use the VitePWA updateSW function if available,
 * and falls back to manually triggering the update if not.
 */
export async function applyUpdate(): Promise<void> {
  try {
    // Try to import the updateSW function from main.tsx
    try {
      const { updateSW } = await import('./main');
      if (updateSW) {
        console.log('Using VitePWA updateSW function');
        // Call with true to send SKIP_WAITING message
        updateSW(true);
        return;
      }
    } catch (err) {
      console.warn('Could not import updateSW from main.tsx, falling back to manual update', err);
    }
    
    // Import the helper function for sending skip waiting message
    const { sendSkipWaitingMessage } = await import('./utils/serviceWorkerHelpers');
    await sendSkipWaitingMessage();
    
    // Set a timeout to reload the page if the controllerchange event doesn't fire
    setTimeout(() => {
      console.log('Forcing page reload after timeout');
      window.location.reload();
    }, 3000);
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