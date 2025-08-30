#!/usr/bin/env node

/**
 * This script validates that key features in the Vehicle.tsx file are present
 * to prevent inadvertent removal of the VIN search functionality.
 */

const fs = require('fs');
const path = require('path');

// Define the file path
const vehicleTsxPath = path.join(__dirname, '..', 'app', 'src', 'features', 'inspection', 'pages', 'Vehicle.tsx');
const vinUtilPath = path.join(__dirname, '..', 'app', 'src', 'utils', 'vin.ts');

// Check if files exist
if (!fs.existsSync(vehicleTsxPath)) {
  console.error('❌ Vehicle.tsx file not found at:', vehicleTsxPath);
  process.exit(1);
}

if (!fs.existsSync(vinUtilPath)) {
  console.error('❌ vin.ts utility file not found at:', vinUtilPath);
  process.exit(1);
}

// Read the file contents
const vehicleTsxContent = fs.readFileSync(vehicleTsxPath, 'utf8');
const vinUtilContent = fs.readFileSync(vinUtilPath, 'utf8');

// Define required features
const requiredFeatures = [
  {
    name: 'SearchIcon import',
    pattern: /import\s+SearchIcon\s+from\s+['"]@mui\/icons-material\/Search['"]/,
    file: 'Vehicle.tsx'
  },
  {
    name: 'VIN utility import',
    pattern: /import\s+{\s*decodeVin,\s*validateVin\s*}\s+from\s+['"]\.\.\/\.\.\/\.\.\/utils\/vin['"]/,
    file: 'Vehicle.tsx'
  },
  {
    name: 'lookingUpVin state',
    pattern: /\[\s*lookingUpVin\s*,\s*setLookingUpVin\s*\]\s*=\s*useState/,
    file: 'Vehicle.tsx'
  },
  {
    name: 'handleVinLookup function',
    pattern: /async\s+function\s+handleVinLookup\s*\(\s*\)/,
    file: 'Vehicle.tsx'
  },
  {
    name: 'VIN search icon in TextField',
    pattern: /endAdornment[\s\S]*?SearchIcon/,
    file: 'Vehicle.tsx'
  },
  {
    name: 'decodeVin function',
    pattern: /export\s+async\s+function\s+decodeVin/,
    file: 'vin.ts'
  },
  {
    name: 'validateVin function',
    pattern: /export\s+function\s+validateVin/,
    file: 'vin.ts'
  }
];

// Check for each feature
let hasErrors = false;
console.log('Validating Vehicle.tsx VIN search functionality:');

for (const feature of requiredFeatures) {
  const content = feature.file === 'Vehicle.tsx' ? vehicleTsxContent : vinUtilContent;
  if (feature.pattern.test(content)) {
    console.log(`✅ ${feature.name} is present`);
  } else {
    console.error(`❌ ${feature.name} is missing from ${feature.file}`);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error('\n⚠️ VIN search functionality may be compromised. Please restore the missing features.');
  process.exit(1);
} else {
  console.log('\n✅ VIN search functionality is intact.');
  process.exit(0);
}
