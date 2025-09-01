/**
 * AI prompts for various features
 * 
 * This file serves as the central export point for all AI prompts used in the application.
 * Externalizing prompts into separate files makes them easier to maintain and iterate upon.
 */

const getInspectionSummaryPrompt = require('./inspectionSummary');
const getOfferLetterPrompt = require('./offerLetter');

module.exports = {
  getInspectionSummaryPrompt,
  getOfferLetterPrompt
};
