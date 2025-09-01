/* eslint-env node */
/* global require, module */
/**
 * Inspections API routes
 * @module routes/inspections
 */

const { Router } = require('express');
const Inspection = require('../models/Inspection.js');
const { secureLog, secureErrorLog } = require('../utils/logger');
const { requireShared } = require('../utils/sharedModules');

// Import shared sanitization utility
const { sanitizeInspectionData } = requireShared('/shared/sanitization');

const router = Router();

router.get('/', async (req, res) => {
  const list = await Inspection.find().sort({ updatedAt: -1 }).limit(100);
  res.json(list);
});

router.post('/', async (req, res) => {
  try {
    secureLog('Received inspection creation request', req.body, ['vin', 'photos', 'airbagLocations']);

    if (!req.body.vehicle || !req.body.sections) {
      secureErrorLog('Missing required fields in request');
      return res.status(400).json({ error: 'Missing required vehicle or sections data' });
    }

    // Use shared sanitization utility to clean and validate data
    const sanitizedData = sanitizeInspectionData(req.body);

    secureLog('Creating inspection document in MongoDB');
    const doc = await Inspection.create(sanitizedData);
    secureLog('Inspection created with ID:', { _id: doc._id });
    res.status(201).json(doc);
  } catch (err) {
    secureErrorLog('Error creating inspection:', err);
    res.status(500).json({ error: 'Failed to create inspection', message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const doc = await Inspection.findById(req.params.id);
  if (!doc) return res.status(404).end();
  res.json(doc);
});

router.put('/:id', async (req, res) => {
  const doc = await Inspection.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).end();
  res.json(doc);
});

router.delete('/:id', async (req, res) => {
  await Inspection.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = router;
