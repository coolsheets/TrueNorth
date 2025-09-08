import dotenv from 'dotenv';
dotenv.config();

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  mongoUri: req('MONGODB_URI'),
  jwtSecret: req('JWT_SECRET'),
  bucket: req('CLOUD_BUCKET'),
  region: req('CLOUD_REGION'),
  openaiKey: req('OPENAI_API_KEY'),
  allowedOrigin: req('ALLOWED_ORIGIN')
};