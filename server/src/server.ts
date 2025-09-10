import { connect } from 'mongoose';
import app from './app.js';
import { env } from './env.js';


async function main() {
  await connect(env.mongoUri);
  const port = process.env.PORT || 8080;  // Using standard port 8080 for development
  app.listen(port, () => console.log(`API running on :${port}`));
}
main().catch(err => { console.error(err); process.exit(1); });
