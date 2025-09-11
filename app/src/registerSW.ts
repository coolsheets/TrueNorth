// Register service worker for PWA functionality

// Simple pub-sub pattern for service worker updates
type UpdateCallback = () => void;
const subscribers: UpdateCallback[] = [];

export function subscribeToSWUpdates(callback: UpdateCallback): () => void {
  subscribers.push(callback);
  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };
}

function notifySubscribers(): void {
  console.log(`Notifying ${subscribers.length} subscribers about SW update`);
  subscribers.forEach(callback => callback());
}

// Check if service workers are supported
if ('serviceWorker' in navigator) {

  window.addEventListener('load', async () => {
    try {
      // Determine the correct path for the service worker
      // In dev mode with VitePWA, it's in dev-dist/sw.js
      // In production, it's in /sw.js
      // For preview mode, also use dev-dist path
      const baseUrl = import.meta.env.BASE_URL || '/';
      const swUrl = new URL(
        import.meta.env.DEV ? 'dev-dist/sw.js' : 'sw.js', 
        new URL(baseUrl, window.location.origin)
      );
      console.log(`Attempting to register service worker from: ${swUrl.pathname}`);
      
      // Register the service worker
      const registration = await navigator.serviceWorker.register(swUrl.pathname, {
        type: 'module',
        scope: import.meta.env.BASE_URL || '/'
      });
      
      console.log('Service Worker registered successfully:', registration);
      console.log('Service Worker scope:', registration.scope);
      
      // Check if we have an active service worker
      if (registration.active) {
        console.log('Service Worker is active');
      } else if (registration.installing) {
        console.log('Service Worker is installing');
      } else if (registration.waiting) {
        console.log('Service Worker is waiting');
        // There's a new service worker waiting to activate
        notifySubscribers();
      }
      
      // Add update detection
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        
        // Track state changes of the service worker
        newWorker.addEventListener('statechange', () => {
          // If the new service worker is installed and waiting
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New service worker is installed and waiting');
            // Dispatch event to notify the app about the update
            notifySubscribers();
          }
        });
      });
      
      // FOR TESTING: Trigger update notification after 5 seconds
      if (import.meta.env.DEV || import.meta.env.MODE === 'preview') {
        setTimeout(() => {
          console.log('TEST: Triggering update notification');
          notifySubscribers();
        }, 5000);
      }
    } catch (error: unknown) {
      console.error('Service Worker registration failed:', error);
      
      // Log more detailed error information
      if (error instanceof Error) {
        if (error.name === 'SecurityError') {
          console.error('SECURITY ERROR: This is likely due to HTTPS issues or MIME type misconfiguration.');
          console.error('Make sure you are using HTTPS or localhost, and the server is sending the correct Content-Type headers.');
        } else if (error.name === 'TypeError') {
          console.error('TYPE ERROR: The URL might be incorrect or the file does not exist.');
        }
      }
    }
  });
} else {
  console.warn('Service Workers are not supported in this browser. PWA functionality will be limited.');
}

/**
 * Update the service worker immediately and reload the page
 */
export async function updateServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.log('No service worker registration found');
      return;
    }
    
    if (registration.waiting) {
      console.log('Found waiting service worker, sending skip-waiting message');
      
      // Add a listener for controllerchange which indicates the new service worker has taken control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        console.log('New service worker controller, refreshing page');
        window.location.reload();
      });
      
      // Send message to the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      console.log('No waiting service worker found, checking for updates');
      await registration.update();
      window.location.reload();
    }
  } catch (error) {
    console.error('Error updating service worker:', error);
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

// Function to trigger install prompt (call this from your install button)
export function showInstallPrompt() {
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
