/**
 * Utility for handling offline-first data synchronization
 */
import { db, InspectionDraft } from '../features/inspection/db';

// Keep track of sync status
let isSyncing = false;
let lastSyncTime = 0;
let syncListeners: Array<(status: string) => void> = [];

/**
 * Adds a listener for sync status changes
 */
export function addSyncListener(callback: (status: string) => void): () => void {
  syncListeners.push(callback);
  return () => {
    syncListeners = syncListeners.filter(cb => cb !== callback);
  };
}

/**
 * Notifies all listeners of sync status changes
 */
function notifySyncListeners(status: string): void {
  syncListeners.forEach(callback => callback(status));
}

/**
 * Synchronizes unsaved inspections with the server when the app comes back online
 */
export async function syncInspectionsWithServer(): Promise<void> {
  // Prevent multiple syncs from running at the same time
  if (isSyncing) {
    console.log('Sync already in progress, skipping');
    return;
  }

  try {
    isSyncing = true;
    notifySyncListeners('syncing');
    
    // Only attempt sync if we're online
    if (!navigator.onLine) {
      console.log('App is offline, skipping sync');
      notifySyncListeners('offline');
      return;
    }

    // Get all unsynced inspections
    const unsynced = await db.getUnsyncedInspections();
    
    if (unsynced.length === 0) {
      console.log('No unsynced inspections to sync');
      notifySyncListeners('up-to-date');
      return;
    }
    
    console.log(`Found ${unsynced.length} unsynced inspections to sync`);
    notifySyncListeners(`syncing-${unsynced.length}`);
    
    // Process each unsynced inspection
    let syncedCount = 0;
    let failedCount = 0;
    
    for (const inspection of unsynced) {
      if (!inspection.id) continue;
      
      try {
        const response = await fetch('/api/inspections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vehicle: inspection.vehicle,
            sections: inspection.sections,
            createdAt: new Date(inspection.createdAt).toISOString(),
            completedAt: inspection.completedAt,
            completed: inspection.completed,
          }),
          // Add credentials and ensure we don't use cached responses
          credentials: 'same-origin',
          cache: 'no-store',
        });
        
        if (response.ok) {
          console.log(`Synced inspection ${inspection.id}`);
          await db.markAsSynced(inspection.id);
          syncedCount++;
          notifySyncListeners(`progress-${syncedCount}/${unsynced.length}`);
        } else {
          console.error(`Failed to sync inspection ${inspection.id}: Server responded with ${response.status}`);
          failedCount++;
        }
      } catch (error) {
        console.error(`Error syncing inspection ${inspection.id}:`, error);
        failedCount++;
      }
    }
    
    lastSyncTime = Date.now();
    
    if (failedCount > 0) {
      notifySyncListeners(`completed-with-errors-${syncedCount}/${unsynced.length}`);
    } else {
      notifySyncListeners(`completed-${syncedCount}/${unsynced.length}`);
    }
    
    console.log(`Sync process completed: ${syncedCount} synced, ${failedCount} failed`);
  } catch (error) {
    console.error('Error during sync process:', error);
    notifySyncListeners('error');
  } finally {
    isSyncing = false;
  }
}

/**
 * Sets up listeners for online/offline status and triggers sync when appropriate
 */
export function setupSyncListeners(): void {
  // Sync when app comes online
  window.addEventListener('online', () => {
    console.log('App is online, starting sync');
    notifySyncListeners('online');
    syncInspectionsWithServer();
  });
  
  // Notify when app goes offline
  window.addEventListener('offline', () => {
    console.log('App is offline, data will be saved locally');
    notifySyncListeners('offline');
  });
  
  // Set up periodic sync (every 5 minutes if we're online)
  setInterval(() => {
    if (navigator.onLine && !isSyncing && Date.now() - lastSyncTime > 5 * 60 * 1000) {
      console.log('Running periodic sync');
      syncInspectionsWithServer();
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
  
  // Initial sync attempt if we're online
  if (navigator.onLine) {
    // Delay initial sync to let the app load first
    setTimeout(() => {
      syncInspectionsWithServer();
    }, 3000);
  }
}
