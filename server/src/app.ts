import express from 'express';
import cors from 'cors';
import { env } from './env.js';
import health from './routes/health.js';
import inspections from './routes/inspections.js';
import ai from './routes/ai.js';


const app = express();
// Allow multiple origins by checking the incoming origin at runtime
app.use(
	cors({
		origin: (incomingOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
			// If no origin (same-origin or non-browser request), allow
			if (!incomingOrigin) return callback(null, true);
			if (env.allowedOrigins.includes('*')) return callback(null, true);
			if (env.allowedOrigins.includes(incomingOrigin)) return callback(null, true);
			// Not allowed
			return callback(new Error('Not allowed by CORS'));
		},
		credentials: true
	})
);
app.use(express.json({ limit: '5mb' }));


app.use('/api/health', health);
app.use('/api/inspections', inspections);
app.use('/api/ai', ai);


export default app;