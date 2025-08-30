import Dexie, { Table } from 'dexie';

export type ItemState = { id: string; status: 'ok'|'warn'|'fail'|'na'; notes?: string; photos?: string[] };
export type SectionState = { slug: string; items: ItemState[] };
export type InspectionDraft = {
  id?: number;
  vehicle: { 
    vin?: string; 
    year?: number; 
    make?: string; 
    model?: string; 
    odo?: number; 
    province?: string;
    // Additional vehicle details
    manufacturer?: string;
    displacement?: string;
    fuelType?: string;
    cylinderCount?: string;
    horsePower?: string;
    cabType?: string;
    gvwr?: string;
    plantInfo?: string;
    airbagLocations?: string;
    brakeSystemType?: string;
    tpmsType?: string;
  };
  sections: SectionState[];
  createdAt: number;
  updatedAt: number;
  completed?: boolean;
  completedAt?: string;
  synced?: boolean;
  syncedAt?: string;
}

export class PpiDB extends Dexie {
  drafts!: Table<InspectionDraft, number>;
  
  constructor(){
    super('ppi-canada');
    
    this.version(1).stores({ 
      drafts: '++id, updatedAt' 
    });
    
    // Add migration to support offline capabilities and data sync
    this.version(2).stores({ 
      drafts: '++id, updatedAt, completed, synced' 
    }).upgrade(tx => {
      return tx.table('drafts').toCollection().modify(draft => {
        // Add new fields to existing records
        draft.createdAt = draft.updatedAt || Date.now();
        draft.completed = false;
        draft.synced = false;
      });
    });
  }

  // Add a method to get all inspections that have not been synced
  async getUnsyncedInspections(): Promise<InspectionDraft[]> {
    return this.drafts.filter(draft => draft.synced === false).toArray();
  }

  // Mark an inspection as synced
  async markAsSynced(id: number): Promise<void> {
    await this.drafts.update(id, { 
      synced: true, 
      syncedAt: new Date().toISOString() 
    });
  }
}

export const db = new PpiDB();
