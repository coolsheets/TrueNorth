import { Router } from 'express';
import Inspection from '../models/Inspection';
const r = Router();


r.get('/', async (req, res) => {
const list = await Inspection.find().sort({ updatedAt: -1 }).limit(100);
res.json(list);
});


r.post('/', async (req, res) => {
const doc = await Inspection.create(req.body);
res.status(201).json(doc);
});


r.get('/:id', async (req, res) => {
const doc = await Inspection.findById(req.params.id);
if (!doc) return res.status(404).end();
res.json(doc);
});


r.put('/:id', async (req, res) => {
const doc = await Inspection.findByIdAndUpdate(req.params.id, req.body, { new: true });
if (!doc) return res.status(404).end();
res.json(doc);
});


r.delete('/:id', async (req, res) => {
await Inspection.findByIdAndDelete(req.params.id);
res.status(204).end();
});


export default r;
