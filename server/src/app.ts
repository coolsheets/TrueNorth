import express from 'express';
import cors from 'cors';
import { env } from './env.js';
import health from './routes/health.js';
import inspections from './routes/inspections.js';
import ai from './routes/ai.js';


const app = express();
app.use(cors({ origin: env.allowedOrigin, credentials: true }));
app.use(express.json({ limit: '5mb' }));


app.use('/api/health', health);
app.use('/api/inspections', inspections);
app.use('/api/ai', ai);


export default app;