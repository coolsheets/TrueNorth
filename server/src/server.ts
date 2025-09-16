import { connect } from 'mongoose';
import app from './app.js';
import { env } from './env.js';


async function main() {
  if (env.mongoUri) {
    await connect(env.mongoUri);
    console.log('Connected to MongoDB');
  } else {
    console.warn('MONGODB_URI not set — running without MongoDB. Sync endpoints will be disabled.');
  }
  const port = process.env.PORT || 8080;  // Using standard port 8080 for development
  app.listen(port, () => console.log(`API running on :${port}`));
}
main().catch(err => { console.error(err); process.exit(1); });
