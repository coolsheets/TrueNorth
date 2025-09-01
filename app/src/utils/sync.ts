import { db } from '../features/inspection/db';
import { isBrowserOnline, registerConnectionFailure, setupOfflineListeners } from './offlineDetection';
import { AISummary } from '../types/summary';
import { sanitizeInspectionData } from '../../../shared/sanitization';

/**
 * Sync all unsynced inspection drafts to the server
 * @returns {Promise<{ success: number, failed: number }>} Count of successful and failed syncs
 */
export async function syncInspections(): Promise<{ success: number; failed: number }> {
  // Skip if offline using enhanced detection
  if (!isBrowserOnline()) {
    console.log('Offline detected - skipping sync');
    return { success: 0, failed: 0 };
  }

  console.log('Starting inspection sync');
  
  // Get all unsynced inspections
  const unsyncedInspections = await db.getUnsyncedInspections();
  
  if (unsyncedInspections.length === 0) {
    console.log('No unsynced inspections to sync');
    return { success: 0, failed: 0 };
  }
  
  console.log(`Found ${unsyncedInspections.length} unsynced inspections`);
  
  let success = 0;
  let failed = 0;
  
  // Process each unsynced inspection
  for (const draft of unsyncedInspections) {
    try {
      console.log(`Syncing inspection ID: ${draft.id}`);
      
      // Use shared sanitization utility to clean data and convert client format to server format
      const cleanedData = sanitizeInspectionData(draft, true);
      
      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });
      
      if (response.ok) {
        console.log(`Successfully synced inspection ID: ${draft.id}`);
        // Mark as synced in local database
        await db.markAsSynced(draft.id!);
        success++;
      } else {
        console.error(`Failed to sync inspection ID: ${draft.id} - Status: ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.error(`Error syncing inspection ID: ${draft.id}`, error);
      failed++;
    }
  }
  
  console.log(`Sync completed - Success: ${success}, Failed: ${failed}`);
  return { success, failed };
}

/**
 * Setup periodic sync and online/offline event listeners
 */
export function setupSyncListeners(): void {
  // Initialize offline detection listeners
  setupOfflineListeners();
  
  // Sync when coming online
  window.addEventListener('online', () => {
    console.log('Back online - initiating sync');
    syncInspections();
  });
  
  // Set up periodic sync (every 5 minutes)
  setInterval(() => {
    if (isBrowserOnline()) {
      syncInspections();
    }
  }, 5 * 60 * 1000);
  
  // Initial sync on startup (with small delay)
  setTimeout(() => {
    if (isBrowserOnline()) {
      syncInspections();
    }
  }, 5000);
}
