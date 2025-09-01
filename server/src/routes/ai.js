/* eslint-env node */
/* global require, module */
/**
 * AI-related endpoints for summarizing inspections and generating offer letters
 * @module routes/ai
 */

const { Router } = require('express');
const { env } = require('../env.js');
const { secureLog, secureErrorLog } = require('../utils/logger');
const { getInspectionSummaryPrompt, getOfferLetterPrompt } = require('../prompts');

/**
 * Constants for inspection score bounds
 */
const INSPECTION_SCORE_MIN = 0;
const INSPECTION_SCORE_MAX = 100;

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
 * @returns {number} - A normalized score between INSPECTION_SCORE_MIN and INSPECTION_SCORE_MAX
 */
const validateInspectionScore = (score) => {
  // Check if the score is a number
  if (typeof score !== 'number') {
    return INSPECTION_SCORE_MIN; // Default to minimum score if not a number
  }
  
  // Clamp the value between MIN and MAX bounds
  return Math.min(Math.max(score, INSPECTION_SCORE_MIN), INSPECTION_SCORE_MAX);
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
    const prompt = getInspectionSummaryPrompt(INSPECTION_SCORE_MIN, INSPECTION_SCORE_MAX);

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

    const prompt = getOfferLetterPrompt();

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
