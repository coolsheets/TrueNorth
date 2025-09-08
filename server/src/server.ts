import { connect } from 'mongoose';
import app from './app.js';
import { env } from './env.js';


async function main() {
  await connect(env.mongoUri);
  const port = process.env.PORT || 8081;  // Changed back to 8081
  app.listen(port, () => console.log(`API running on :${port}`));
}
main().catch(err => { console.error(err); process.exit(1); });
