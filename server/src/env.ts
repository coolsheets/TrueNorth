import dotenv from 'dotenv';
dotenv.config();

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  // Make MongoDB URI optional: allow server to start in environments without DB (admin pages will show helpful errors)
  mongoUri: process.env['MONGODB_URI'] || undefined,
  jwtSecret: process.env['JWT_SECRET'] || '',
  bucket: process.env['CLOUD_BUCKET'] || '',
  region: process.env['CLOUD_REGION'] || '',
  // Make OpenAI key optional so server can start and provide clear errors when missing.
  openaiKey: process.env['OPENAI_API_KEY'] || undefined,
  allowedOrigin: process.env['ALLOWED_ORIGIN'] || '*'
};