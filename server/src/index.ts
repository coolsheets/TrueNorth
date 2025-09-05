import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());
// ...your other middleware and routes...

// HTTP fallback (optional)
app.listen(8080, () => {
  console.log('[INFO] HTTP API running on :8080');
});

// HTTPS server
const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '../../app/key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, '../../app/cert.pem')),
};

https.createServer(httpsOptions, app).listen(8443, () => {
  console.log('[INFO] HTTPS API running on :8443');
});