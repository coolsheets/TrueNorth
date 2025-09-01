/* eslint-env node */
/* global require, module, console */
/**
 * Secure logging utilities
 * @module utils/logger
 */

const { env } = require('../env');

/**
 * Sanitizes an object by removing sensitive fields or redacting them
 * @param {Object} obj - The object to sanitize
 * @param {string[]} [sensitiveFields=['vin', 'photos', 'airbagLocations']] - List of sensitive field names to redact
 * @returns {Object} - A sanitized copy of the object
 */
function sanitizeObject(obj, sensitiveFields = ['vin', 'photos', 'airbagLocations']) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, sensitiveFields));
  }

  // Create a copy of the object to avoid modifying the original
  const sanitized = { ...obj };

  // Recursively sanitize nested objects and redact sensitive fields
  for (const [key, value] of Object.entries(sanitized)) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      // Redact sensitive fields
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(value, sensitiveFields);
    }
  }

  return sanitized;
}

/**
 * Securely logs objects, redacting sensitive information in production
 * @param {string} message - Log message
 * @param {Object} [data] - Data to log (will be sanitized in production)
 * @param {string[]} [sensitiveFields] - Fields to redact
 */
function secureLog(message, data = null, sensitiveFields = ['vin', 'photos', 'airbagLocations']) {
  console.log(message);
  
  if (data) {
    if (env.isProduction) {
      // In production, sanitize the data before logging
      const sanitized = sanitizeObject(data, sensitiveFields);
      console.log('Data:', JSON.stringify(sanitized).slice(0, 200) + (JSON.stringify(sanitized).length > 200 ? '...' : ''));
    } else {
      // In development, log limited data for debugging
      console.log('Data:', JSON.stringify(data).slice(0, 200) + (JSON.stringify(data).length > 200 ? '...' : ''));
    }
  }
}

/**
 * Securely logs errors
 * @param {string} message - Error message
 * @param {Error|any} [error] - Error object
 */
function secureErrorLog(message, error = null) {
  console.error(message);
  
  if (error) {
    if (error instanceof Error) {
      console.error(error.stack || error.message);
    } else {
      console.error(String(error));
    }
  }
}

module.exports = {
  secureLog,
  secureErrorLog,
  sanitizeObject
};
