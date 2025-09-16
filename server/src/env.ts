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
  // Make OpenAI key optional so server can start and provide clear errors when missing.
  openaiKey: process.env['OPENAI_API_KEY'] || undefined,
  allowedOrigin: req('ALLOWED_ORIGIN')
};