import express, { Request, Response } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Define interfaces
interface Inspection {
  id?: number;
  localId?: number;
  mongoId?: string;
  vin: string;
  inspectionDate: Date | string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
  };
  status: string;
  inspectionType: string;
  sections: Array<{
    name: string;
    items: Array<{
      name: string;
      status: string;
      notes?: string;
    }>;
  }>;
  updatedAt?: Date;
  createdAt?: Date;
  [key: string]: unknown;
}

interface SyncQuery {
  updatedAt?: { $gt: Date };
  localId?: { $nin: number[] };
}

const router = express.Router();
const uri = process.env.MONGODB_URI;

let client: MongoClient | null = null;

const connectToMongo = async () => {
  if (!client) {
    client = new MongoClient(uri as string);
    await client.connect();
  }
  return client.db('truenorth');
};

// Health check endpoint
router.head('/health', (req: Request, res: Response) => {
  res.status(200).send();
});

// Get all inspections
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = await connectToMongo();
    const inspections = await db.collection('inspections').find({}).toArray();
    res.json(inspections);
  } catch (error) {
    console.error('Error fetching inspections:', error);
    res.status(500).json({ error: 'Failed to fetch inspections' });
  }
});

// Get a single inspection
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = await connectToMongo();
    const inspection = await db.collection('inspections').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    
    res.json(inspection);
  } catch (error) {
    console.error('Error fetching inspection:', error);
    res.status(500).json({ error: 'Failed to fetch inspection' });
  }
});

// Sync inspections
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const { inspections, lastSyncTimestamp } = req.body;
    
    if (!Array.isArray(inspections)) {
      return res.status(400).json({ error: 'Expected an array of inspections' });
    }
    
    const db = await connectToMongo();
    
    const results = {
      syncedIds: [] as number[],
      mongoIds: {} as Record<number, string>,
      serverInspections: [] as Inspection[]
    };
    
    // 1. Push local inspections to server
    for (const inspection of inspections) {
      const { id, ...inspectionData } = inspection;
      
      // Insert or update in MongoDB
      const result = await db.collection('inspections').updateOne(
        { localId: id },
        { $set: { ...inspectionData, localId: id, updatedAt: new Date() } },
        { upsert: true }
      );
      
      results.syncedIds.push(id);
        if (result.upsertedId) {
          results.mongoIds[id] = result.upsertedId.toString();
        } else {
          // Fetch the _id for updated documents
          const existingDoc = await db.collection('inspections').findOne({ localId: id });
          if (existingDoc && existingDoc._id) {
            results.mongoIds[id] = existingDoc._id.toString();
          }
        }
    }
    
    // 2. Get server inspections updated since last sync
    const query: SyncQuery = {};
    if (lastSyncTimestamp) {
      query.updatedAt = { $gt: new Date(lastSyncTimestamp) };
    }
    
    // Exclude inspections we just synced to avoid duplicates
    if (results.syncedIds.length > 0) {
      query.localId = { $nin: results.syncedIds };
    }
    
    const serverInspections = await db.collection('inspections')
      .find(query)
      .toArray();
    
    results.serverInspections = serverInspections as unknown as Inspection[];
    
    res.json(results);
  } catch (error) {
    console.error('Error syncing inspections:', error);
    res.status(500).json({ error: 'Failed to sync inspections' });
  }
});

export default router;