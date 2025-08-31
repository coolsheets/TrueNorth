const express = require('express');
const cors = require('cors');
const { env } = require('./env');
const health = require('./routes/health');
const inspections = require('./routes/inspections');
const ai = require('./routes/ai.js'); // Changed from ./routes/ai to ./routes/ai.js


const app = express();
app.use(cors({ origin: env.allowedOrigin, credentials: true }));
app.use(express.json({ limit: '5mb' }));


app.use('/api/health', health);
app.use('/api/inspections', inspections);
app.use('/api/ai', ai);


module.exports = app;