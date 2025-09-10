// Utility for checking online/offline status and providing feedback
import { useState, useEffect } from 'react';

let isOnline = navigator.onLine;

// Function to check if the service worker is active and controlling the page
export function isServiceWorkerActive(): boolean {
  return 'serviceWorker' in navigator && 
         navigator.serviceWorker !== undefined && 
         navigator.serviceWorker.controller !== null;
}

// Function to check online status
export function checkOnlineStatus(): boolean {
  return isOnline;
}

// React hook for online/offline status
export function useOfflineStatus(): boolean {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}

// Set up event listeners to update online status
window.addEventListener('online', () => {
  isOnline = true;
  // Dispatch a custom event that components can listen for
  window.dispatchEvent(new CustomEvent('connectivity-changed', { detail: { online: true } }));
});

window.addEventListener('offline', () => {
  isOnline = false;
  // Dispatch a custom event that components can listen for
  window.dispatchEvent(new CustomEvent('connectivity-changed', { detail: { online: false } }));
});

// Function to test if caching is working properly
export async function testOfflineCapability(url: string = window.location.href): Promise<boolean> {
  // Check if service worker and caches are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker API not supported');
    return false;
  }
  
  if (!('caches' in window)) {
    console.warn('Cache API not supported');
    return false;
  }

  try {
    // First check if service worker is controlling the page
    if (!navigator.serviceWorker.controller) {
      console.warn('Service Worker not controlling the page yet');
      return false;
    }
    
    // Check different cache names since Workbox might use different naming schemes
    const cacheNames = ['workbox-precache', 'pwa-assets', 'offline-cache'];
    
    for (const cacheName of cacheNames) {
      try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(url);
        
        if (cachedResponse !== undefined) {
          return true;
        }
      } catch (e) {
        // Continue to next cache name
        console.log(`Cache "${cacheName}" not found or not accessible`);
      }
    }
    
    // If no cache matched, try to list all caches and check each one
    const allCaches = await caches.keys();
    
    for (const cacheName of allCaches) {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(url);
      
      if (cachedResponse !== undefined) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error testing offline capability:', error);
    return false;
  }
}

// Hook to check if the app is installed
export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
}
