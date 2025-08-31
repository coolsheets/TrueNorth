/* eslint-env node */
/* global require, module */
/**
 * Inspection model
 * @module models/Inspection
 */

const { Schema, model } = require('mongoose');

const ItemSchema = new Schema({
  id: String,
  label: String,
  status: { type: String, enum: ['ok','warn','fail','na'], default: 'ok' },
  notes: { type: String, default: '' },
  photos: { type: [String], default: [] }
}, { _id: false });

const SectionSchema = new Schema({
  name: String,
  items: { type: [ItemSchema], default: [] }
}, { _id: false });

const InspectionSchema = new Schema({
  userId: String,
  vehicle: {
    vin: String,
    year: Number,
    make: String,
    model: String,
    trim: String,
    odo: Number,
    province: String,
    // Add additional VIN-retrieved fields
    manufacturer: String,
    displacement: String,
    fuelType: String,
    cylinderCount: String,
    horsePower: String,
    cabType: String,
    gvwr: String,
    plantInfo: String,
    airbagLocations: String,
    brakeSystemType: String,
    tpmsType: String
  },
  sections: [SectionSchema],
  attachments: [String],
  aiSummary: Schema.Types.Mixed, // Store AI summary data as a flexible schema
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = model('Inspection', InspectionSchema);
