/**
 * Shared types and interfaces for both client and server
 */

/**
 * Vehicle information
 */
export interface Vehicle {
  vin?: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  odo?: number;
  province?: string;
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
}

/**
 * Item inspection state
 */
export interface InspectionItem {
  id: string;
  status: 'ok' | 'warn' | 'fail' | 'na';
  notes?: string;
  photos?: string[];
}

/**
 * Section in an inspection
 */
export interface InspectionSection {
  name: string; // On server this is "name"
  slug?: string; // On client this is "slug"
  items: InspectionItem[];
}

/**
 * Adjustment suggestion from AI
 */
export interface AdjustmentSuggestion {
  type: string;
  amount: number;
  reason: string;
}

/**
 * AI summary response
 */
export interface AISummary {
  summary: string;
  redFlags: string[];
  yellowFlags: string[];
  greenNotes: string[];
  inspectionScore: number;
  estRepairTotalCAD?: number;
  suggestedAdjustments: AdjustmentSuggestion[];
}

/**
 * Complete inspection data
 */
export interface InspectionData {
  vehicle: Vehicle;
  sections: InspectionSection[];
  createdAt?: string | number;
  updatedAt?: string | number;
  aiSummary?: AISummary | null;
}
