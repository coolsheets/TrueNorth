import Dexie from 'dexie';
import { InspectionType } from '../types/inspection';

interface SyncSettings {
  id: string;
  lastSyncTimestamp: string | null;
}

class InspectionDatabase extends Dexie {
  inspections: Dexie.Table<InspectionType, number>;
  settings: Dexie.Table<SyncSettings, string>;

  constructor() {
    super('truenorth-inspections');
    this.version(2).stores({
      inspections: '++id, mongoId, date, status, synced, locallyModified',
      settings: 'id'
    });
    this.inspections = this.table('inspections');
    this.settings = this.table('settings');
  }
}

export const db = new InspectionDatabase();

// Handle database upgrade
db.on('versionchange', () => {
  // Ensure we have an initial sync settings record
  db.settings.get('syncSettings').then(settings => {
    if (!settings) {
      db.settings.put({
        id: 'syncSettings',
        lastSyncTimestamp: null
      });
    }
  });
});