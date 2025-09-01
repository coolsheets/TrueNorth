/* eslint-env node */
/* global require, module */
/**
 * Common utility for using TypeScript shared modules in CommonJS environment
 */

function requireShared(modulePath) {
  return require(`../../../${modulePath}`);
}

module.exports = { requireShared };
