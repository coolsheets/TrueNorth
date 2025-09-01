/* eslint-env node */
/* global require, module */
/**
 * AI-related endpoints for summarizing inspections and generating offer letters
 * @module routes/ai
 */

const { Router } = require('express');
const { env } = require('../env.js');
const { secureLog, secureErrorLog } = require('../utils/logger');

/**
 * Helper function to ensure a value is an array of strings
 * @param {any} value - The value to convert
 * @returns {string[]} - An array of strings
 */
const ensureStringArray = (value) => {
  return Array.isArray(value) ? value.map(item => String(item)) : [];
};

/**
 * Validates and normalizes an inspection score
 * @param {any} score - The score to validate
 * @returns {number} - A normalized score between 0-100
 */
const validateInspectionScore = (score) => {
  // Check if the score is a number
  if (typeof score !== 'number') {
    return 0; // Default to 0 if not a number
  }
  
  // Clamp the value between 0 and 100
  return Math.min(Math.max(score, 0), 100);
};

/**
 * Express router for AI-related endpoints
 * @type {import('express').Router}
 */
const router = Router();

/**
 * Summarize inspection data
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
router.post('/summarize', async (req, res) => {
  try {
    secureLog('Received AI summarize request', req.body, ['vin', 'photos', 'airbagLocations']);
    
    const { vehicle, sections } = req.body;
    
    if (!vehicle || !sections) {
      secureErrorLog('Missing required fields in request body');
      return res.status(400).json({ error: 'Missing required fields in request body' });
    }
    
    if (!env.openaiKey) {
      secureErrorLog('OpenAI API key is missing');
      return res.status(500).json({ error: 'API configuration error' });
    }
    
    secureLog('Initializing OpenAI client');
    const openai = await import('openai');
    const client = new openai.default({ apiKey: env.openaiKey });

    const text = JSON.stringify({ vehicle, sections });
    const prompt = `You are an expert used-vehicle inspector in Canada. Summarize red/yellow/green findings, estimate CAD repair ranges, and suggest a negotiation delta. 
    
Output JSON with these keys:
- summary: string - Overall summary of vehicle condition (one paragraph of text)
- redFlags: string[] - Array of strings describing critical issues
- yellowFlags: string[] - Array of strings describing cautionary items
- greenNotes: string[] - Array of strings describing positive aspects
- estRepairTotalCAD: number - Estimated repair cost in CAD (just the number, no formatting)
- inspectionScore: number - Overall vehicle score from 0-100 (100 being perfect condition)
- suggestedAdjustments: object[] - Array of objects with negotiation suggestions, each having:
  - type: string - Type of adjustment (e.g., "Suspension", "Body Damage")
  - amount: number - Amount in CAD
  - reason: string - Reason for the adjustment

For redFlags, yellowFlags, and greenNotes arrays, all items must be simple strings. Format text mentions of amounts like "$X,XXX CAD for [reason]". Ensure your response is valid JSON.`;

    secureLog('Sending request to OpenAI API');
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text }
      ],
      response_format: { type: "json_object" }
    });

    secureLog('Received response from OpenAI API');
    const out = resp.choices[0]?.message?.content || '{}';
    try {
      secureLog('Parsing OpenAI response');
      const parsedResponse = JSON.parse(out);
      secureLog('Successfully parsed response');
      
      // Format the response for the client
      const formattedResponse = {
        summary: parsedResponse.summary || '',
        redFlags: ensureStringArray(parsedResponse.redFlags),
        yellowFlags: ensureStringArray(parsedResponse.yellowFlags),
        greenNotes: ensureStringArray(parsedResponse.greenNotes),
        // Validate and normalize the inspection score
        inspectionScore: validateInspectionScore(parsedResponse.inspectionScore),
        // Process suggestedAdjustments as objects
        suggestedAdjustments: Array.isArray(parsedResponse.suggestedAdjustments) ? 
          parsedResponse.suggestedAdjustments.map(adj => {
            // If it's already an object with the expected structure, use it as is
            if (typeof adj === 'object' && adj !== null && 'type' in adj && 'amount' in adj) {
              return {
                type: String(adj.type),
                amount: typeof adj.amount === 'number' ? adj.amount : parseFloat(String(adj.amount)) || 0,
                reason: adj.reason ? String(adj.reason) : ''
              };
            }
            // If it's a string or another format, convert to a simple object
            return {
              type: 'Adjustment',
              amount: 0,
              reason: typeof adj === 'string' ? adj : String(adj)
            };
          }) : []
      };
      
      res.json(formattedResponse);
    } catch (error) {
      secureErrorLog('Error parsing OpenAI response:', error);
      secureLog('Raw response content', { content: out });
      res.status(500).json({ 
        error: 'Failed to parse AI response',
        summary: 'There was an issue generating the summary. The AI response could not be properly formatted.'
      });
    }
  } catch (error) {
    secureErrorLog('Error generating AI summary:', error);
    res.status(500).json({ error: 'Failed to generate AI summary' });
  }
});

/**
 * Generate an offer letter
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
router.post('/offer-letter', async (req, res) => {
  try {
    const { vehicle, priceAsk, findings } = req.body;
    
    if (!env.openaiKey) {
      secureErrorLog('OpenAI API key is missing');
      return res.status(500).json({ error: 'API configuration error' });
    }
    
    const openai = await import('openai');
    const client = new openai.default({ apiKey: env.openaiKey });

    const prompt = `Draft a concise, professional buyer email for a Canadian used-vehicle purchase. Reflect inspection findings and propose an adjusted offer. Keep it 150-200 words.`;

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: JSON.stringify({ vehicle, priceAsk, findings }) }
      ]
    });

    const content = resp.choices[0]?.message?.content || '';
    res.json({ email: content });
  } catch (error) {
    secureErrorLog('Error generating offer letter:', error);
    res.status(500).json({ error: 'Failed to generate offer letter' });
  }
});

module.exports = router;
