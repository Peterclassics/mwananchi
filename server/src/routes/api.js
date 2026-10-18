import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as auth from '../controllers/auth.js';
import * as requests from '../controllers/requests.js';
import { authenticated, admin, csrfToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { ok } from '../utils/http.js';
import { health } from '../controllers/health.js';
import * as account from '../controllers/account.js';
export const api = Router();
api.get('/health', health);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({
      success: false,
      message: 'Too many attempts. Try again in 15 minutes.',
      data: null,
    }),
});
api.get('/auth/csrf', (req, res) =>
  ok(res, { csrfToken: csrfToken(req, res) }),
);
api.post('/auth/register', limiter, auth.register);
api.post('/auth/login', limiter, auth.login);
api.post('/auth/logout', auth.logout);
api.get('/auth/me', authenticated, auth.me);
api.patch('/account/profile', authenticated, account.profile);
api.post('/account/password', authenticated, limiter, account.password);
api.get('/categories', authenticated, requests.categories);
api.get('/requests', authenticated, requests.list);
api.post('/requests', authenticated, upload, requests.create);
api.get('/requests/:id/image', authenticated, requests.image);
api.get('/requests/:id', authenticated, requests.get);
api.get('/dashboard/citizen', authenticated, requests.dashboard);
api.use('/admin', authenticated, admin);
api.get('/admin/requests/export', requests.exportCsv);
api.get('/admin/requests', requests.list);
api.get('/admin/requests/:id', requests.get);
api.patch('/admin/requests/:id/status', requests.status);
api.post('/admin/requests/:id/updates', requests.update);
api.get('/admin/analytics', requests.dashboard);
