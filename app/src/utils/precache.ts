// src/utils/precache.ts

import { db } from '../features/inspection/db';

/**
 * This function ensures critical app data is loaded and cached
 * for offline use. It should be called when the app starts.
 */
export async function precacheAppData(): Promise<void> {
  try {
    console.log('Precaching critical app data for offline use');
    
    // Make sure service worker is registered
    if ('serviceWorker' in navigator) {
      // Check if any inspections exist in the local DB
      const inspectionCount = await db.drafts.count();
      console.log(`Current inspection count in local DB: ${inspectionCount}`);
      
      // If we're online, try to fetch recent inspections from the API to ensure
      // they're available offline
      if (navigator.onLine && inspectionCount === 0) {
        try {
          console.log('Fetching recent inspections for offline availability');
          const response = await fetch('/api/inspections');
          if (response.ok) {
            const inspections = await response.json();
            
            // Store inspections in IndexedDB
            if (Array.isArray(inspections) && inspections.length > 0) {
              console.log(`Storing ${inspections.length} inspections for offline use`);
              
              // Create transaction to add all inspections at once
              await db.transaction('rw', db.drafts, async () => {
                for (const inspection of inspections) {
                  // Mark as synced since we're getting it from the server
                  inspection.synced = true;
                  inspection.syncedAt = new Date().toISOString();
                  await db.drafts.put(inspection);
                }
              });
              
              console.log('Successfully precached inspections');
            } else {
              console.log('No inspections to precache');
            }
          } else {
            console.warn('Failed to fetch inspections for precaching', response.status);
          }
        } catch (error) {
          console.error('Error precaching inspections', error);
        }
      }
    } else {
      console.warn('Service worker not supported - offline functionality will be limited');
    }
  } catch (error) {
    console.error('Error in precacheAppData', error);
  }
}

/**
 * Initialize app precaching
 */
export function initializePrecaching(): void {
  // Initialize precaching once DOM is loaded
  window.addEventListener('DOMContentLoaded', () => {
    // Slight delay to avoid competing with other startup tasks
    setTimeout(() => {
      precacheAppData();
    }, 2000);
  });
}
