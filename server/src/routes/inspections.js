/* eslint-env node */
/* global require, module, console */
/**
 * Inspections API routes
 * @module routes/inspections
 */

const { Router } = require('express');
const Inspection = require('../models/Inspection.js');
const router = Router();

router.get('/', async (req, res) => {
  const list = await Inspection.find().sort({ updatedAt: -1 }).limit(100);
  res.json(list);
});

router.post('/', async (req, res) => {
  try {
    console.log('Received inspection creation request');
    console.log('Request body:', JSON.stringify(req.body).slice(0, 200) + '...');

    if (!req.body.vehicle || !req.body.sections) {
      console.error('Missing required fields in request');
      return res.status(400).json({ error: 'Missing required vehicle or sections data' });
    }

    // Sanitize the data before saving to MongoDB
    const sanitizedData = {
      ...req.body,
      sections: req.body.sections.map((section) => ({
        ...section,
        items: section.items.map((item) => ({
          ...item,
          // Ensure photos is always a proper array of strings
          photos: Array.isArray(item.photos) ? 
            item.photos.filter((p) => typeof p === 'string') : 
            []
        }))
      }))
    };

    console.log('Creating inspection document in MongoDB');
    const doc = await Inspection.create(sanitizedData);
    console.log('Inspection created with ID:', doc._id);
    res.status(201).json(doc);
  } catch (err) {
    console.error('Error creating inspection:', err);
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
