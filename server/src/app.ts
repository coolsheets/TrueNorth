import express from 'express';
import cors from 'cors';
import { env } from './env';
import health from './routes/health';
import inspections from './routes/inspections';
import ai from './routes/ai';


const app = express();
app.use(cors({ origin: env.allowedOrigin, credentials: true }));
app.use(express.json({ limit: '5mb' }));


app.use('/api/health', health);
app.use('/api/inspections', inspections);
app.use('/api/ai', ai);


export default app;