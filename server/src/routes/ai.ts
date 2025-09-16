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
  // If there's no OpenAI key, return a clear error so callers understand the online AI path is unavailable.
  if (!env.openaiKey) {
    console.warn('OpenAI key not configured; falling back to local summary if available');
    return res.status(503).json({ error: 'Online AI unavailable: OPENAI_API_KEY not configured. Using local fallback.' });
  }

  try {
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
  } catch (err) {
    // Type-safe extraction of message from unknown error (avoid leaking secrets)
    function extractMessage(e: unknown): string {
      if (!e) return String(e);
      if (typeof e === 'string') return e;
      if (typeof e === 'object' && e !== null && 'message' in e) {
        return (e as { message?: unknown }).message as string || String(e);
      }
      return String(e);
    }

    const safeMsg = extractMessage(err);
    console.error('OpenAI API request failed:', safeMsg);
    return res.status(502).json({ error: 'Online AI request failed', details: safeMsg });
  }
});

/**
 * Generate an offer letter based on inspection findings
 */
r.post('/offer-letter', async (req: express.Request, res: express.Response) => {
  const { vehicle, priceAsk, findings } = req.body;

  const prompt = `Draft a concise, professional buyer email for a Canadian used-vehicle purchase. Reflect inspection findings and propose an adjusted offer. Keep it 150-200 words.`;

  // Check for API key before attempting to import or call OpenAI SDK
  if (!env.openaiKey) {
    console.warn('OpenAI key not configured; cannot generate offer-letter online');
    return res.status(503).json({ error: 'Online AI unavailable: OPENAI_API_KEY not configured. Using local fallback.' });
  }

  try {
    const openai = await import('openai');
    const client = new openai.default({ apiKey: env.openaiKey });

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: JSON.stringify({ vehicle, priceAsk, findings }) }
      ]
    });

    res.json({ email: resp.choices[0]?.message?.content || '' });
  } catch (err) {
    // Type-safe extraction of message from unknown error
    function extractMessage(e: unknown): string {
      if (!e) return String(e);
      if (typeof e === 'string') return e;
      if (typeof e === 'object' && e !== null && 'message' in e) {
        return (e as { message?: unknown }).message as string || String(e);
      }
      return String(e);
    }

    const safeMsg = extractMessage(err);
    console.error('OpenAI API request failed:', safeMsg);
    return res.status(502).json({ error: 'Online AI request failed', details: safeMsg });
  }
});


export default r;
