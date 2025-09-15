export interface InspectionItem {
  name: string;
  status: 'ok' | 'warn' | 'fail' | 'na';
  notes?: string;
}

export interface InspectionSection {
  name: string;
  items: InspectionItem[];
}

export interface Vehicle {
  make: string;
  model: string;
  year: number;
  vin: string;
  odometer: number;
  licensePlate?: string;
  province?: string;
}

export interface InspectionType {
  id: number;
  mongoId?: string;
  date: string;
  status: 'IN PROGRESS' | 'COMPLETED' | 'FAILED';
  synced: boolean;
  syncedAt?: string;
  locallyModified?: boolean;
  vehicle: Vehicle;
  sections: InspectionSection[];
  inspector?: string;
  notes?: string;
  location?: string;
}

export interface ServerInspection extends Omit<InspectionType, 'id' | 'mongoId'> {
  _id: string;
  localId?: number;
}