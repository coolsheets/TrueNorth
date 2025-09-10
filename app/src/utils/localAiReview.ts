import { Status } from '../features/inspection/schema';
import { CRITICAL_SYSTEMS, REPAIR_COSTS, RepairCostEntry } from './constants';

interface Vehicle {
  make: string;
  model: string;
  year: number;
  vin: string;
  odo: number;
  [key: string]: unknown;
}

interface InspectionItem {
  id: string;
  label?: string;
  status: Status;
  notes?: string;
}

interface InspectionSection {
  name: string;
  slug: string;
  items: InspectionItem[];
}

interface AiReviewResult {
  summary: string;
  redFlags: string[];
  yellowFlags: string[];
  greenNotes: string[];
  estRepairTotalCAD: number;
  suggestedAdjustments: string[];
  inspectionScore: number;
}

/**
 * Performs a local lightweight AI review of inspection data
 * without requiring an external API call
 */
export const generateLocalAiReview = (
  vehicle: Vehicle,
  sections: InspectionSection[]
): AiReviewResult => {
  // Initialize result
  const result: AiReviewResult = {
    summary: '',
    redFlags: [],
    yellowFlags: [],
    greenNotes: [],
    estRepairTotalCAD: 0,
    suggestedAdjustments: [],
    inspectionScore: 0
  };

  // Count issues by severity
  let totalItems = 0;
  let failCount = 0;
  let warnCount = 0;
  let okCount = 0;

  // Analyze each section and item
  sections.forEach(section => {
    section.items.forEach(item => {
      if (!item.status || item.status === 'na') return;
      
      totalItems++;
      
      if (item.status === 'fail') {
        failCount++;
        const flagText = `${section.name}: ${item.label || item.id}${item.notes ? ` - ${item.notes}` : ''}`;
        result.redFlags.push(flagText);
        
        // Add repair cost estimate for known expensive items
        if (REPAIR_COSTS[item.id]) {
          result.estRepairTotalCAD += REPAIR_COSTS[item.id].cost;
          result.suggestedAdjustments.push(
            `${REPAIR_COSTS[item.id].label}: -$${REPAIR_COSTS[item.id].cost}`
          );
        }
        
        // Critical system failures should be highlighted
        if (CRITICAL_SYSTEMS.includes(item.id)) {
          result.suggestedAdjustments.push(
            `Consider if ${item.label?.toLowerCase() || item.id} issue is worth repairing`
          );
        }
      } else if (item.status === 'warn') {
        warnCount++;
        result.yellowFlags.push(`${section.name}: ${item.label || item.id}${item.notes ? ` - ${item.notes}` : ''}`);
        
        // Add partial cost for warnings on expensive items
        if (REPAIR_COSTS[item.id]) {
          const warningCost = Math.round(REPAIR_COSTS[item.id].cost * 0.4);
          result.estRepairTotalCAD += warningCost;
          result.suggestedAdjustments.push(
            `${REPAIR_COSTS[item.id].label} (minor): -$${warningCost}`
          );
        }
      } else if (item.status === 'ok') {
        okCount++;
        result.greenNotes.push(`${section.name}: ${item.label || item.id}${item.notes ? ` - ${item.notes}` : ''}`);
      }
    });
  });
  
  // Calculate inspection score (0-100)
  if (totalItems > 0) {
    // Weight fails more heavily than warnings
    result.inspectionScore = Math.round(
      100 * (okCount + (warnCount * 0.5)) / totalItems
    );
  }
  
  // Prevent negative scores
  result.inspectionScore = Math.max(0, Math.min(100, result.inspectionScore));
  
  // Generate a summary based on findings
  const year = vehicle.year || 'Unknown year';
  const make = vehicle.make || 'Unknown make';
  const model = vehicle.model || 'Unknown model';
  const odo = vehicle.odo ? `${vehicle.odo.toLocaleString()} km` : 'Unknown mileage';
  
  if (failCount === 0 && warnCount === 0) {
    result.summary = `This ${year} ${make} ${model} (${odo}) is in excellent condition with no significant issues found during inspection.`;
  } else if (failCount === 0 && warnCount > 0) {
    result.summary = `This ${year} ${make} ${model} (${odo}) is in good overall condition with ${warnCount} minor issues that may need attention in the future.`;
  } else if (failCount <= 2) {
    result.summary = `This ${year} ${make} ${model} (${odo}) has ${failCount} significant issues that require attention, along with ${warnCount} minor concerns. Estimated repairs of $${result.estRepairTotalCAD} CAD should be considered in negotiations.`;
  } else {
    result.summary = `This ${year} ${make} ${model} (${odo}) has ${failCount} major issues requiring immediate attention. With an estimated repair cost of $${result.estRepairTotalCAD} CAD, careful consideration is advised before purchase.`;
  }
  
  // Return the compiled results
  return result;
};

/**
 * Generate a simple offer letter based on inspection findings
 */
export const generateLocalOfferLetter = (
  vehicle: Vehicle,
  priceAsk: number,
  findings: AiReviewResult
): string => {
  const { make, model, year } = vehicle;
  const { redFlags, yellowFlags, estRepairTotalCAD } = findings;
  
  // Calculate suggested offer (simple algorithm)
  const repairAdjustment = estRepairTotalCAD || 0;
  const negotiationBuffer = Math.min(priceAsk * 0.05, 1000); // 5% or $1000, whichever is less
  const suggestedOffer = Math.max(priceAsk - repairAdjustment - negotiationBuffer, priceAsk * 0.7);
  
  // Format currency
  const formatPrice = (price: number) => price.toLocaleString('en-CA', { 
    style: 'currency', 
    currency: 'CAD',
    maximumFractionDigits: 0
  });
  
  // Generate letter based on findings
  let letter = `Dear Seller,\n\nThank you for the opportunity to view the ${year} ${make} ${model}. `;
  
  if (redFlags.length === 0 && yellowFlags.length === 0) {
    letter += `I was impressed with the vehicle's condition. `;
  } else if (redFlags.length === 0) {
    letter += `The vehicle is in good overall condition with only minor concerns. `;
  } else {
    letter += `After a thorough inspection, I've identified several issues that require attention. `;
  }
  
  if (redFlags.length > 0 || yellowFlags.length > 0) {
    letter += `My inspection revealed `;
    
    if (redFlags.length > 0) {
      letter += `${redFlags.length} significant issues `;
      if (yellowFlags.length > 0) {
        letter += `and `;
      }
    }
    
    if (yellowFlags.length > 0) {
      letter += `${yellowFlags.length} minor concerns `;
    }
    
    letter += `that would need repairs totaling approximately ${formatPrice(repairAdjustment)}. `;
  }
  
  letter += `\nBased on my assessment, I would like to offer ${formatPrice(suggestedOffer)} for the vehicle. `;
  
  if (repairAdjustment > 0) {
    letter += `This accounts for the necessary repairs while still offering a fair price. `;
  }
  
  letter += `\nPlease let me know if this works for you. I'm available to discuss further details at your convenience.\n\nRegards,\n[Your Name]`;
  
  return letter;
};
