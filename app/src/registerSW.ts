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
  // Notify subscribers in this tab
  subscribers.forEach(callback => callback());
  
  // Notify other tabs by setting a localStorage item
  try {
    localStorage.setItem('sw-update-available', Date.now().toString());
  } catch (e) {
    console.warn('Failed to use localStorage for SW update notification', e);
  }
}

// Check if service workers are supported
if ('serviceWorker' in navigator) {
  // Listen for updates from other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'sw-update-available') {
      console.log('Received SW update notification from another tab');
      notifySubscribers();
    }
  });

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
// Enhanced function to reliably update the service worker
export async function updateServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  
  try {
    // Clear the update notification flag from localStorage
    try {
      localStorage.removeItem('sw-update-available');
      sessionStorage.removeItem('sw-update-available');
      console.log('Cleared update flags from storage');
    } catch (e) {
      console.warn('Failed to clear storage flags', e);
    }
    
    // Force reload immediately to apply updates
    console.log('Forcing immediate reload to apply service worker updates');
    window.location.reload();
    
    // The code below will only run if the immediate reload fails
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.log('No service worker registration found');
      window.location.reload();
      return;
    }

    // Set up a listener for the controllerchange event
    // This happens when a new service worker takes control
    let refreshing = false;
    const controllerChangeListener = () => {
      if (refreshing) return;
      refreshing = true;
      console.log('New service worker has taken control, reloading page');
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', controllerChangeListener);
    
    if (registration.waiting) {
      console.log('Found waiting service worker, activating it');
      
      // Try multiple methods to activate the waiting service worker
      
      // Method 1: postMessage to the waiting service worker
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Method 2: Use messageServiceWorker utility function as backup
      await messageServiceWorker(registration.waiting, { type: 'SKIP_WAITING' });
      
      // If the controllerchange event doesn't fire within 3 seconds, 
      // force a reload anyway as a fallback
      setTimeout(() => {
        if (!refreshing) {
          console.log('Force reload after timeout (no controllerchange event)');
          window.location.reload();
        }
      }, 3000);
    } else {
      console.log('No waiting service worker found, forcing update and reload');
      // Check for updates and reload regardless
      await registration.update();
      window.location.reload();
    }
  } catch (error) {
    console.error('Error updating service worker:', error);
    // As last resort, force a reload even on error
    window.location.reload();
  }
}

// Utility function to send a message to a service worker with a timeout
async function messageServiceWorker(sw: ServiceWorker, message: { type: string; [key: string]: unknown }): Promise<unknown> {
  return new Promise((resolve, reject) => {
    // Create a message channel for two-way communication
    const messageChannel = new MessageChannel();
    
    // Set up a timeout in case the service worker doesn't respond
    const timeout = setTimeout(() => {
      reject(new Error('Timeout: Service worker did not respond'));
    }, 2000);
    
    // Listen for a response from the service worker
    messageChannel.port1.onmessage = (event) => {
      clearTimeout(timeout);
      resolve(event.data);
    };
    
    // Send the message to the service worker
    sw.postMessage(message, [messageChannel.port2]);
  }).catch(err => {
    console.warn('messageServiceWorker failed:', err);
    // Don't throw, this is a best-effort approach
  });
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
