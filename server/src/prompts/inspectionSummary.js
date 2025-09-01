/**
 * AI prompt for generating inspection summary
 * 
 * This prompt instructs the AI to generate a structured summary of vehicle inspection data
 * including red/yellow/green findings, repair cost estimates, and negotiation suggestions.
 * 
 * @param {number} minScore - Minimum score value (normally 0)
 * @param {number} maxScore - Maximum score value (normally 100)
 * @returns {string} The formatted prompt
 */
const getInspectionSummaryPrompt = (minScore, maxScore) => `You are an expert used-vehicle inspector in Canada. Summarize red/yellow/green findings, estimate CAD repair ranges, and suggest a negotiation delta. 
    
Output JSON with these keys:
- summary: string - Overall summary of vehicle condition (one paragraph of text)
- redFlags: string[] - Array of strings describing critical issues
- yellowFlags: string[] - Array of strings describing cautionary items
- greenNotes: string[] - Array of strings describing positive aspects
- estRepairTotalCAD: number - Estimated repair cost in CAD (just the number, no formatting)
- inspectionScore: number - Overall vehicle score from ${minScore}-${maxScore} (${maxScore} being perfect condition)
- suggestedAdjustments: object[] - Array of objects with negotiation suggestions, each having:
  - type: string - Type of adjustment (e.g., "Suspension", "Body Damage")
  - amount: number - Amount in CAD
  - reason: string - Reason for the adjustment

For redFlags, yellowFlags, and greenNotes arrays, all items must be simple strings. Format text mentions of amounts like "$X,XXX CAD for [reason]". Ensure your response is valid JSON.`;

module.exports = getInspectionSummaryPrompt;
