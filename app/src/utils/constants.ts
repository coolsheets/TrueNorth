/**
 * Constants for vehicle inspection application
 */

/**
 * Critical vehicle systems that require special attention during inspection
 */
export const CRITICAL_SYSTEMS = ['brakes', 'startup', 'drive', 'frame', 'leaks'];

/**
 * Type definition for repair cost entry
 */
export interface RepairCostEntry {
  cost: number;
  label: string;
}

/**
 * Repair cost estimates for various vehicle components in CAD
 */
export const REPAIR_COSTS: Record<string, RepairCostEntry> = {
  'frame': { cost: 3000, label: 'Frame rust repairs' },
  'cab': { cost: 2500, label: 'Body rust repairs' },
  'panels': { cost: 1500, label: 'Body panel repairs' },
  'glass': { cost: 800, label: 'Windshield replacement' },
  'tires-condition': { cost: 1200, label: 'Tire replacement' },
  'leaks': { cost: 1000, label: 'Fluid leak repairs' },
  'belts': { cost: 400, label: 'Belt/hose replacement' },
  'hvac': { cost: 1200, label: 'HVAC system repairs' }
};
