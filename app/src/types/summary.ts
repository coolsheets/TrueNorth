/**
 * Interface for adjustment suggestion from AI
 */
export interface AdjustmentSuggestion {
  type: string;  // Type of adjustment (e.g., "Suspension", "Body Damage")
  amount: number; // Amount in CAD
  reason: string; // Reason for the adjustment
}

/**
 * Interface for AI-generated inspection summary
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
