import { Router } from 'express';
const r = Router();
r.get('/', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));
export default r;
