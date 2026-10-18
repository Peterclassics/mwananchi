import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { config, serverRoot } from './config/env.js';
import { api } from './routes/api.js';
import { csrf } from './middleware/auth.js';
import { errorHandler } from './middleware/errors.js';
export const app = express();
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'img-src': ["'self'", 'blob:', 'data:'],
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
        ],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'script-src': ["'self'"],
        'connect-src': ["'self'"],
      },
    },
  }),
);
app.use(cors({ origin: config.origin, credentials: true }));
app.use(express.json({ limit: '32kb' }), cookieParser());
app.use(
  '/api',
  (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  },
  csrf,
  api,
);
app.use('/api', (_req, res) =>
  res
    .status(404)
    .json({ success: false, message: 'Endpoint not found', data: null }),
);
if (config.production) {
  const dist = path.resolve(serverRoot, '../client/dist');
  app.use(express.static(dist));
  app.get('/{*path}', (_req, res) =>
    res.sendFile(path.join(dist, 'index.html')),
  );
}
app.use(errorHandler);
