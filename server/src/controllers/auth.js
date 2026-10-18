import bcrypt from 'bcrypt';
import * as users from '../repositories/users.js';
import {
  parse,
  registration,
  login as loginSchema,
} from '../validators/index.js';
import { ok, HttpError } from '../utils/http.js';
import { startSession, cookieOptions, csrfToken } from '../middleware/auth.js';
export async function register(req, res) {
  const data = parse(registration, req.body);
  const user = await users.insert(data, await bcrypt.hash(data.password, 12));
  startSession(res, user);
  ok(res, { user: users.publicUser(user) }, 'Account created', 201);
}
// Always perform a bcrypt comparison, including for unknown accounts.
const dummy = await bcrypt.hash('invalid-placeholder-password', 12);
export async function login(req, res) {
  const data = parse(loginSchema, req.body);
  const user = await users.byEmail(data.email);
  const valid = await bcrypt.compare(
    data.password,
    user?.password_hash || dummy,
  );
  if (!user || !valid) throw new HttpError(401, 'Incorrect email or password.');
  startSession(res, user);
  ok(
    res,
    { user: users.publicUser(await users.byId(user.id)) },
    'Welcome back',
  );
}
export function logout(_req, res) {
  res.clearCookie('ht_session', cookieOptions);
  ok(res, null, 'Signed out');
}
export function me(req, res) {
  ok(res, { user: users.publicUser(req.user), csrfToken: csrfToken(req, res) });
}
