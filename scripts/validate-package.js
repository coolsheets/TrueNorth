#!/usr/bin/env node

const fs = require('fs');

try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  // List of critical scripts that should not be removed
  const criticalScripts = ['dev:mobile', 'dev:app:host'];
  
  const missingScripts = criticalScripts.filter(script => !packageJson.scripts[script]);
  
  if (missingScripts.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'ERROR: The following critical scripts are missing:');
    missingScripts.forEach(script => {
      console.error('\x1b[33m%s\x1b[0m', `  - ${script}`);
    });
    console.error('\x1b[31m%s\x1b[0m', 'These scripts are required for proper mobile and PWA testing.');
    process.exit(1);
  }
  
  console.log('\x1b[32m%s\x1b[0m', 'All critical scripts are present! ✓');
  process.exit(0);
} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', 'Failed to validate package.json:');
  console.error(error);
  process.exit(1);
}
