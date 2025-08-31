/* eslint-env node */
/* global require, process, console */
/**
 * Server startup script
 * @module server
 */

const { connect } = require('mongoose');
const app = require('./app.js'); // Updated to reference app.js
const { env } = require('./env.js');

async function main() {
  await connect(env.mongoUri);
  const port = process.env.PORT || 8080;
  app.listen(port, () => console.log(`API running on :${port}`));
}

main().catch(err => { 
  console.error(err); 
  process.exit(1); 
});
