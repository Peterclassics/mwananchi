import bcrypt from 'bcrypt';
import * as users from '../repositories/users.js';
import { HttpError } from '../utils/http.js';
export async function changePassword(id, data) {
  const record = await users.passwordRecord(id);
  if (
    !record ||
    !(await bcrypt.compare(data.current_password, record.password_hash))
  )
    throw new HttpError(400, 'Check your current password.', {
      current_password: 'The current password is incorrect.',
    });
  if (await bcrypt.compare(data.new_password, record.password_hash))
    throw new HttpError(400, 'Choose a different password.', {
      new_password: 'Your new password must differ from your current password.',
    });
  const changed = await users.replacePassword(
    id,
    record.password_hash,
    await bcrypt.hash(data.new_password, 12),
  );
  if (!changed)
    throw new HttpError(
      409,
      'Your password changed in another session. Please sign in again.',
    );
  return users.byId(id);
}
