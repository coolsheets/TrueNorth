import express from 'express';
const router = express.Router();

router.get('/', (_: express.Request, res: express.Response) => res.json({ ok: true, ts: new Date().toISOString() }));

export default router;