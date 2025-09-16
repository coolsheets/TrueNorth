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

    // If MongoDB is not configured, return clear 503 so callers can handle gracefully
    if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
      return res.status(503).json({ error: 'MongoDB not configured in this environment' });
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
      // Ensure we do not include localId in the $set payload (avoid conflicting update operators)
      // Create a copy of inspectionData without localId to avoid conflicting updates
      const inspectionDataNoLocal: Record<string, unknown> = { ...(inspectionData as Record<string, unknown>) };
      if ('localId' in inspectionDataNoLocal) delete inspectionDataNoLocal.localId;
      const formattedData = {
        ...inspectionDataNoLocal,
        updatedAt: new Date()
      };

      // Previously used an `update` object for upserts; now we perform explicit find+update/create.

          // Instead of an upsert (which caused conflicting-update errors on localId),
          // check for existing document and update or create explicitly.
          // Load existing document (not lean) so we can modify and save the Mongoose document
          const existing = await Inspection.findOne({ localId: id });
          let savedDoc;
          if (existing) {
            // Debug: log existing doc id and localId
            console.debug(`Sync: found existing inspection _id=${existing._id} localId=${existing.localId}`);

            // Apply updates directly to the document fields (avoid using conflicting update operators)
            for (const [key, value] of Object.entries(formattedData)) {
              // don't overwrite _id or localId here
              if (key === '_id' || key === 'localId') continue;
              // @ts-ignore assign dynamic keys
              existing[key] = value as any;
            }
            existing.updatedAt = new Date();

            // Save the document (this uses Mongoose document save, no update operators)
            savedDoc = await existing.save();
          } else {
            // Create a new document with localId set
            const toCreate = { ...formattedData, localId: id, createdAt: new Date() } as Record<string, unknown>;
            console.debug(`Sync: creating new inspection localId=${id} payloadKeys=${Object.keys(toCreate).join(',')}`);
            savedDoc = await Inspection.create(toCreate);
          }

          results.syncedIds.push(id);
          if (!savedDoc) {
            console.error(`Failed to save inspection with localId ${id}`);
            return res.status(500).json({ error: `Failed to save inspection with localId ${id}` });
          }
          results.mongoIds[id] = savedDoc._id.toString();
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
        _id: plainDoc._id.toString(),
        // Mongoose may return null for missing fields; normalize null -> undefined to match ServerInspection type
        localId: plainDoc.localId ?? undefined
      };
    });
    
    res.json(results);
  } catch (error) {
    console.error('Error syncing inspections:', error);
    res.status(500).json({ error: 'Failed to sync inspections' });
  }
});


export default router;
