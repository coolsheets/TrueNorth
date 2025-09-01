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
  suggestedAdjustments: string[];
}
