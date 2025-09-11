// Inspection types
export interface VehicleData {
  year: string;
  make: string;
  model: string;
  vin: string;
  mileage: number;
  color?: string;
  trim?: string;
  stockNumber?: string;
}

export interface InspectionItem {
  id: string;
  name: string;
  condition: 'critical' | 'major' | 'minor' | 'good' | 'na';
  notes?: string;
  images?: string[];
}

export interface InspectionSection {
  id: string;
  title: string;
  items: InspectionItem[];
}

export interface InspectionDraft {
  id: string;
  vehicle: VehicleData;
  sections: InspectionSection[];
  created: string;
  updated: string;
}
