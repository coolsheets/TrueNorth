// Manual PWA installation debugging tools

let deferredPrompt: any = null;

// Listen for the beforeinstallprompt event and store the event
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt event fired');
  e.preventDefault();
  deferredPrompt = e;
});

// Listen for appinstalled event
window.addEventListener('appinstalled', (e) => {
  console.log('App was installed', e);
  deferredPrompt = null;
});

// Check if we have a stored prompt and if the app is already installed
export function checkInstallationStatus() {
  return {
    promptAvailable: !!deferredPrompt,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true,
    isInstalled: document.querySelector('meta[name="apple-mobile-web-app-capable"]') !== null || 
                 navigator.standalone === true
  };
}

// Function to force show install prompt if available
export function manualShowInstallPrompt() {
  if (!deferredPrompt) {
    console.log('No installation prompt available');
    
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return Promise.reject('App is already installed');
    }
    
    // Check if service worker is registered
    if (navigator.serviceWorker) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (!registration) {
          console.error('Service worker not registered - PWA criteria not met');
        }
      });
    }
    
    // Log more detailed diagnostics
    console.error('PWA installation diagnostics:', {
      serviceWorkerSupported: 'serviceWorker' in navigator,
      isHTTPS: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
      promptStored: !!deferredPrompt,
      alreadyInstalled: window.matchMedia('(display-mode: standalone)').matches
    });
    
    return Promise.reject('No installation prompt available');
  }

  console.log('Showing installation prompt');
  
  // Show the prompt
  return deferredPrompt.prompt()
    .then(() => deferredPrompt.userChoice)
    .then((choiceResult: {outcome: string}) => {
      console.log('User installation choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the installation');
      } else {
        console.log('User dismissed the installation');
      }
      
      // Clear the prompt reference
      deferredPrompt = null;
      return choiceResult;
    });
}

// Check if an app can be installed on the current device
export async function canInstallPWA() {
  // Must check for service worker support first
  if (!('serviceWorker' in navigator)) {
    return { 
      canInstall: false, 
      reason: 'Service Workers not supported' 
    };
  }
  
  // Check for installed service worker
  const swRegistration = await navigator.serviceWorker.getRegistration();
  if (!swRegistration) {
    return { 
      canInstall: false, 
      reason: 'Service Worker not registered' 
    };
  }
  
  // Check if app is already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return { 
      canInstall: false, 
      reason: 'Already installed' 
    };
  }
  
  return { 
    canInstall: true, 
    reason: 'Can be installed' 
  };
}
