import express from 'express';
import Inspection from '../models/Inspection.js';
const router = express.Router();


router.get('/', async (_: express.Request, res: express.Response) => {
  const list = await Inspection.find().sort({ updatedAt: -1 }).limit(100);
  res.json(list);
});


router.post('/', async (req: express.Request, res: express.Response) => {
  const doc = await Inspection.create(req.body);
  res.status(201).json(doc);
});


router.get('/:id', async (req: express.Request, res: express.Response) => {
  const doc = await Inspection.findById(req.params.id);
  if (!doc) return res.status(404).end();
  res.json(doc);
});


router.put('/:id', async (req: express.Request, res: express.Response) => {
  const doc = await Inspection.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).end();
  res.json(doc);
});


router.delete('/:id', async (req: express.Request, res: express.Response) => {
  await Inspection.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// Bidirectional sync endpoint for admin dashboard
router.post('/sync', async (req: express.Request, res: express.Response) => {
  try {
    const { inspections, lastSyncTimestamp } = req.body;
    
    if (!Array.isArray(inspections)) {
      return res.status(400).json({ error: 'Expected an array of inspections' });
    }
    
    interface ServerInspection {
      _id: string;
      localId?: number;
      [key: string]: unknown;
    }
    
    const results = {
      syncedIds: [] as number[],
      mongoIds: {} as Record<number, string>,
      serverInspections: [] as ServerInspection[]
    };
    
    // 1. Push local inspections to server
    for (const inspection of inspections) {
      const { id, ...inspectionData } = inspection;
      
      // Convert local data to match the mongoose model structure
      const formattedData = {
        ...inspectionData,
        localId: id,
        updatedAt: new Date()
      };
      
      // Insert or update in MongoDB
      const result = await Inspection.findOneAndUpdate(
        { localId: id },
        formattedData,
        { upsert: true, new: true }
      );
      
      results.syncedIds.push(id);
      if (!result) {
        console.error(`Failed to upsert inspection with localId ${id}`);
        return res.status(500).json({ error: `Failed to upsert inspection with localId ${id}` });
      }
      results.mongoIds[id] = result._id.toString();
    }
    
    // 2. Get server inspections updated since last sync
    const query: Record<string, unknown> = {};
    if (lastSyncTimestamp) {
      query.updatedAt = { $gt: new Date(lastSyncTimestamp) };
    }
    
    // Exclude inspections we just synced to avoid duplicates
    if (results.syncedIds.length > 0) {
      query.localId = { $nin: results.syncedIds };
    }
    
    const serverInspections = await Inspection.find(query).sort({ updatedAt: -1 });
    
    // Convert MongoDB documents to plain objects with string IDs
    results.serverInspections = serverInspections.map(doc => {
      const plainDoc = doc.toObject();
      return {
        ...plainDoc,
        _id: plainDoc._id.toString()
      };
    });
    
    res.json(results);
  } catch (error) {
    console.error('Error syncing inspections:', error);
    res.status(500).json({ error: 'Failed to sync inspections' });
  }
});


export default router;
