import { Router, Request, Response } from 'express';
import Inspection from '../models/Inspection.js';
const router = Router();


router.get('/', async (_: Request, res: Response) => {
const list = await Inspection.find().sort({ updatedAt: -1 }).limit(100);
res.json(list);
});


router.post('/', async (req: Request, res: Response) => {
const doc = await Inspection.create(req.body);
res.status(201).json(doc);
});


router.get('/:id', async (req: Request, res: Response) => {
const doc = await Inspection.findById(req.params.id);
if (!doc) return res.status(404).end();
res.json(doc);
});


router.put('/:id', async (req: Request, res: Response) => {
const doc = await Inspection.findByIdAndUpdate(req.params.id, req.body, { new: true });
if (!doc) return res.status(404).end();
res.json(doc);
});


router.delete('/:id', async (req: Request, res: Response) => {
await Inspection.findByIdAndDelete(req.params.id);
res.status(204).end();
});


export default router;
