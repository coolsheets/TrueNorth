import { Router, Request, Response } from 'express';
const router = Router();

router.get('/', (_: Request, res: Response) => res.json({ ok: true, ts: new Date().toISOString() }));

export default router;
