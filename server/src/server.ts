import { connect } from 'mongoose';
import app from './app';
import { env } from './env';


async function main() {
await connect(env.mongoUri);
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API running on :${port}`));
}
main().catch(err => { console.error(err); process.exit(1); });
