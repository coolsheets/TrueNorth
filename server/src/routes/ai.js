/* eslint-env node */
/* global require, module, console */
/**
 * AI-related endpoints for summarizing inspections and generating offer letters
 * @module routes/ai
 */

const { Router } = require('express');
const { env } = require('../env.js');

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
    console.log('Received AI summarize request with body:', JSON.stringify(req.body).slice(0, 200) + '...');
    
    const { vehicle, sections } = req.body;
    
    if (!vehicle || !sections) {
      console.error('Missing required fields in request body');
      return res.status(400).json({ error: 'Missing required fields in request body' });
    }
    
    if (!env.openaiKey) {
      console.error('OpenAI API key is missing');
      return res.status(500).json({ error: 'API configuration error' });
    }
    
    console.log('Initializing OpenAI client');
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
- suggestedAdjustments: string[] - Array of strings with negotiation suggestions

All array items must be simple strings, not objects. Format amounts like "$X,XXX CAD for [reason]". Ensure your response is valid JSON.`;

    console.log('Sending request to OpenAI API');
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text }
      ],
      response_format: { type: "json_object" }
    });

    console.log('Received response from OpenAI API');
    const out = resp.choices[0]?.message?.content || '{}';
    try {
      console.log('Parsing OpenAI response');
      const parsedResponse = JSON.parse(out);
      console.log('Successfully parsed response');
      
      // Format the response for the client
      const formattedResponse = {
        summary: parsedResponse.summary || '',
        redFlags: Array.isArray(parsedResponse.redFlags) ? parsedResponse.redFlags.map(item => String(item)) : [],
        yellowFlags: Array.isArray(parsedResponse.yellowFlags) ? parsedResponse.yellowFlags.map(item => String(item)) : [],
        greenNotes: Array.isArray(parsedResponse.greenNotes) ? parsedResponse.greenNotes.map(item => String(item)) : [],
        inspectionScore: parsedResponse.inspectionScore || 0,
        suggestedAdjustments: Array.isArray(parsedResponse.suggestedAdjustments) ? parsedResponse.suggestedAdjustments.map(item => String(item)) : []
      };
      
      res.json(formattedResponse);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.log('Raw response content:', out);
      res.status(500).json({ 
        error: 'Failed to parse AI response',
        summary: 'There was an issue generating the summary. The AI response could not be properly formatted.'
      });
    }
  } catch (error) {
    console.error('Error generating AI summary:', error);
    console.error(error instanceof Error ? error.stack : 'Unknown error');
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
      console.error('OpenAI API key is missing');
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
    console.error('Error generating offer letter:', error);
    res.status(500).json({ error: 'Failed to generate offer letter' });
  }
});

module.exports = router;
