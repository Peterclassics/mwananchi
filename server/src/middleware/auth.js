import jwt from 'jsonwebtoken';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { config } from '../config/env.js';
import { byId } from '../repositories/users.js';
import { HttpError } from '../utils/http.js';
export const cookieOptions = {
  httpOnly: true,
  secure: config.production,
  sameSite: 'lax',
  path: '/',
};
export function csrfToken(req, res) {
  let token = req.cookies.ht_csrf;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    token = randomBytes(32).toString('hex');
    res.cookie('ht_csrf', token, cookieOptions);
  }
  return token;
}
export function csrf(req, _res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const a = Buffer.from(req.cookies.ht_csrf || ''),
    b = Buffer.from(req.get('X-CSRF-Token') || '');
  if (!a.length || a.length !== b.length || !timingSafeEqual(a, b))
    throw new HttpError(403, 'Security token expired. Refresh and try again.');
  if (req.get('origin') && req.get('origin') !== config.origin)
    throw new HttpError(403, 'Origin not allowed');
  next();
}
export async function authenticated(req, _res, next) {
  try {
    const payload = jwt.verify(req.cookies.ht_session || '', config.secret, {
      algorithms: ['HS256'],
      issuer: 'hudumatrack',
      audience: 'hudumatrack-web',
    });
    req.user = await byId(payload.sub);
    if (req.user && payload.session_version !== req.user.session_version)
      throw new HttpError(401, 'Please sign in again.');
  } catch (error) {
    if (error.code) throw error;
    throw new HttpError(401, 'Your session has expired. Please sign in.');
  }
  if (!req.user) throw new HttpError(401, 'Please sign in.');
  next();
}
export function admin(req, _res, next) {
  if (req.user.role !== 'admin')
    throw new HttpError(403, 'Administrator access required');
  next();
}
export function startSession(res, user) {
  const token = jwt.sign(
    { session_version: user.session_version },
    config.secret,
    {
      subject: String(user.id),
      expiresIn: config.expiry,
      algorithm: 'HS256',
      issuer: 'hudumatrack',
      audience: 'hudumatrack-web',
    },
  );
  res.cookie('ht_session', token, cookieOptions);
}
