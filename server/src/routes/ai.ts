import express from 'express';
import { env } from '../env.js';

/**
 * Express router for AI-related endpoints
 */
const r = express.Router();

/**
 * Summarize inspection data
 */
r.post('/summarize', async (req: express.Request, res: express.Response) => {
  const { vehicle, sections } = req.body;
  const openai = await import('openai');
  const client = new openai.default({ apiKey: env.openaiKey });


  const text = JSON.stringify({ vehicle, sections });
  const prompt = `You are an expert used-vehicle inspector in Canada. Summarize red/yellow/green findings, estimate CAD repair ranges, and suggest a negotiation delta. Output JSON with keys: summary, redFlags[], yellowFlags[], greenNotes[], estRepairTotalCAD, suggestedAdjustments[].`;


  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: text }
    ]
  });


  const out = resp.choices[0]?.message?.content || '{}';
  const cleanedOut = out.replace(/```json/g, '').replace(/```/g, '').trim();
  res.json(JSON.parse(cleanedOut));
});

/**
 * Generate an offer letter based on inspection findings
 */
r.post('/offer-letter', async (req: express.Request, res: express.Response) => {
  const { vehicle, priceAsk, findings } = req.body;
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


  res.json({ email: resp.choices[0]?.message?.content || '' });
});


export default r;
