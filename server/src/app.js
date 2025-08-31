/* eslint-env node */
/* global require, module */
/**
 * Express application setup
 * @module app
 */

const express = require('express');
const cors = require('cors');
const { env } = require('./env.js');
const health = require('./routes/health.js');
const inspections = require('./routes/inspections.js');
const ai = require('./routes/ai.js');

const app = express();
app.use(cors({ origin: env.allowedOrigin, credentials: true }));
app.use(express.json({ limit: '5mb' }));

app.use('/api/health', health);
app.use('/api/inspections', inspections);
app.use('/api/ai', ai);

module.exports = app;
