import { pool } from '../config/database.js';
export const publicFields = 'id, full_name, email, phone, role, created_at';
export async function byEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email=?', [
    email,
  ]);
  return rows[0];
}
export async function byId(id) {
  const [rows] = await pool.execute(
    `SELECT ${publicFields}, session_version FROM users WHERE id=?`,
    [id],
  );
  return rows[0];
}
export function publicUser(user) {
  const { session_version: _version, ...safe } = user;
  return safe;
}
export async function updateProfile(id, data) {
  await pool.execute('UPDATE users SET full_name=?,phone=? WHERE id=?', [
    data.full_name,
    data.phone || null,
    id,
  ]);
  return byId(id);
}
export async function passwordRecord(id) {
  const [rows] = await pool.execute(
    'SELECT password_hash FROM users WHERE id=?',
    [id],
  );
  return rows[0];
}
export async function replacePassword(id, previousHash, nextHash) {
  const [result] = await pool.execute(
    'UPDATE users SET password_hash=?,session_version=session_version+1 WHERE id=? AND password_hash=?',
    [nextHash, id, previousHash],
  );
  return result.affectedRows === 1;
}
export async function insert(data, hash) {
  const [result] = await pool.execute(
    'INSERT INTO users(full_name,email,phone,password_hash) VALUES (?,?,?,?)',
    [data.full_name, data.email, data.phone || null, hash],
  );
  return byId(result.insertId);
}
