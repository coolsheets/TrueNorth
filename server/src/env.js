/* eslint-env node */
/* global require, module, process */
/**
 * Environment configuration
 * @module env
 */

const dotenv = require('dotenv');
dotenv.config();

/**
 * Gets a required environment variable
 * @param {string} name - The name of the environment variable
 * @returns {string} The environment variable value
 * @throws {Error} If the environment variable is not set
 */
function req(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: req('MONGODB_URI'),
  jwtSecret: req('JWT_SECRET'),
  bucket: req('CLOUD_BUCKET'),
  region: req('CLOUD_REGION'),
  openaiKey: req('OPENAI_API_KEY'),
  allowedOrigin: req('ALLOWED_ORIGIN')
};

// Helper to check if we're in production
env.isProduction = env.nodeEnv === 'production';

module.exports = { env };
