#!/usr/bin/env node
/* eslint-env node */
/* global require, process, __dirname, console */

/**
 * Script to build shared TypeScript files for both client and server
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Paths
const rootDir = path.resolve(__dirname, '..');
const sharedDir = path.join(rootDir, 'shared');
const outputDir = path.join(rootDir, 'dist', 'shared');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Compile shared TypeScript files
console.log('Compiling shared TypeScript files...');
try {
  // Using TypeScript compiler directly for shared files
  execSync(`npx tsc --project ${rootDir}/tsconfig.json --outDir ${outputDir} ${sharedDir}/*.ts`, {
    stdio: 'inherit'
  });
  console.log('Shared TypeScript files compiled successfully!');
} catch (error) {
  console.error('Error compiling shared TypeScript files:', error);
  process.exit(1);
}
