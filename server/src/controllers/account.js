import { parse, profileInput, passwordInput } from '../validators/index.js';
import { updateProfile, publicUser } from '../repositories/users.js';
import { changePassword } from '../services/account.js';
import { startSession } from '../middleware/auth.js';
import { ok } from '../utils/http.js';
export async function profile(req, res) {
  const user = await updateProfile(req.user.id, parse(profileInput, req.body));
  ok(
    res,
    { user: publicUser(user) },
    'Your personal details have been updated.',
  );
}
export async function password(req, res) {
  const user = await changePassword(
    req.user.id,
    parse(passwordInput, req.body),
  );
  startSession(res, user);
  ok(res, null, 'Password changed. Your other sessions have been signed out.');
}
