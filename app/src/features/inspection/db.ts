import Dexie, { Table } from 'dexie';

export type ItemState = { id: string; status: 'ok'|'warn'|'fail'|'na'; notes?: string; photos?: string[] };
export type SectionState = { slug: string; items: ItemState[] };
export type InspectionDraft = {
  id?: number;
  vehicle: { vin?: string; year?: number; make?: string; model?: string; odo?: number; province?: string };
  sections: SectionState[];
  updatedAt: number;
}

export class PpiDB extends Dexie {
  drafts!: Table<InspectionDraft, number>;
  constructor(){
    super('ppi-canada');
    this.version(1).stores({ drafts: '++id, updatedAt' });
  }
}
export const db = new PpiDB();
