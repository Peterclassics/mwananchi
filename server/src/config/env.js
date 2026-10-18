import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const serverRoot = fileURLToPath(new URL('../../', import.meta.url));
dotenv.config({
  path: path.join(
    serverRoot,
    process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  ),
  quiet: true,
});
export const config = {
  port: Number(process.env.PORT || 4000),
  production: process.env.NODE_ENV === 'production',
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5174',
  secret: process.env.JWT_SECRET,
  expiry: process.env.JWT_EXPIRY || '8h',
  uploads: path.resolve(serverRoot, process.env.UPLOAD_DIR || 'uploads'),
  maxUpload: Math.min(Number(process.env.MAX_UPLOAD_SIZE || 5242880), 5242880),
};
if (!config.secret || config.secret.length < 32)
  throw new Error(
    'Set JWT_SECRET to at least 32 characters in server/.env (or .env.test).',
  );
