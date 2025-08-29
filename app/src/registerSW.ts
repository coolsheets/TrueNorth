// Service worker registration for PWA
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Ensure fresh checks for SW updates
      });
      
      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed but waiting');
      } else if (registration.active) {
        console.log('Service worker active');
      }
      
      // Check for updates periodically
      setInterval(() => {
        registration.update();
        console.log('Checking for service worker updates');
      }, 60 * 60 * 1000); // Check every hour
      
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};
