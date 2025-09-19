import { db } from '../db';
import { ServerInspection } from '../types/inspection';

interface SyncResult {
  syncedIds: number[];
  mongoIds: Record<number, string>;
  serverInspections: ServerInspection[];
}

export const syncWithAtlas = async (): Promise<void> => {
  // Check if online
  if (!navigator.onLine) {
    throw new Error('Cannot sync while offline');
  }
  
  try {
    // Log sync start time
    console.log(`Sync started at: ${new Date().toLocaleTimeString()}`);
    
    // 1. Get all local inspections from IndexedDB
    const localInspections = await db.inspections.toArray();
    // Filter unsynced or locally modified inspections once
    const unsyncedInspections = localInspections.filter(i => !i.synced || i.locallyModified);

    // 2. Get last sync timestamp
    const settings = await db.settings.get('syncSettings');
    const lastSyncTimestamp = settings?.lastSyncTimestamp || null;

    // 3. Push to server and get server updates
  const apiBase = (import.meta.env as { VITE_API_BASE?: string }).VITE_API_BASE || '';
    const response = await fetch(`${apiBase}/api/inspections/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inspections: unsyncedInspections,
        lastSyncTimestamp
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
    
    const result: SyncResult = await response.json();
    
    // 4. Update local records as synced
    await db.transaction('rw', db.inspections, async () => {
      for (const id of result.syncedIds) {
        await db.inspections.update(id, { 
          synced: true,
          locallyModified: false,
          syncedAt: new Date().toISOString(),
          mongoId: result.mongoIds[id] || localInspections.find(i => i.id === id)?.mongoId
        });
      }
      
      // 5. Process server inspections - add or update
      for (const serverInspection of result.serverInspections) {
        const { _id, ...inspectionData } = serverInspection;
        
        // Check if we have this inspection locally by MongoDB ID
        const existingByMongoId = localInspections.find(i => i.mongoId === _id);
        
        // Check if we have this inspection locally by local ID
        const existingByLocalId = inspectionData.localId 
          ? localInspections.find(i => i.id === inspectionData.localId)
          : null;
        
        if (existingByMongoId) {
          // Update existing by mongo ID
          await db.inspections.update(existingByMongoId.id, {
            ...inspectionData,
            id: existingByMongoId.id,
            mongoId: _id,
            synced: true,
            locallyModified: false,
            syncedAt: new Date().toISOString()
          });
        } else if (existingByLocalId) {
          // Update existing by local ID
          await db.inspections.update(existingByLocalId.id, {
            ...inspectionData,
            id: existingByLocalId.id,
            mongoId: _id,
            synced: true,
            locallyModified: false,
            syncedAt: new Date().toISOString()
          });
        } else {
          // Add new inspection
          // Generate a robust numeric ID to avoid collisions
          const uniqueId = inspectionData.localId || Date.now() + Math.floor(Math.random() * 1e9);
          await db.inspections.add({
            ...inspectionData,
            id: uniqueId,
            mongoId: _id,
            synced: true,
            locallyModified: false,
            syncedAt: new Date().toISOString()
          });
        }
      }
    });
    
    // 6. Update the last sync timestamp
    await db.settings.put({
      id: 'syncSettings',
      lastSyncTimestamp: new Date().toISOString()
    });
    
    // Log sync completion time
    console.log(`Sync completed at: ${new Date().toLocaleTimeString()}`);
    
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
};

// Mark an inspection as modified locally
export const markLocallyModified = async (id: number): Promise<void> => {
  await db.inspections.update(id, {
    locallyModified: true,
    synced: false
  });
};
