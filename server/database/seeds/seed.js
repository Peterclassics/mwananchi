import bcrypt from 'bcrypt';
import { pool, transaction } from '../../src/config/database.js';
const categories = [
  ['Street lighting', 'Broken or faulty public streetlights'],
  ['Water supply', 'Water interruptions and leaking public pipes'],
  ['Waste collection', 'Missed collection and illegal dumping'],
  ['Roads & footpaths', 'Potholes and damaged public roads'],
  ['Drainage', 'Blocked drains and flooding'],
  ['Other services', 'Other public service concerns'],
];
try {
  const {
    SEED_ADMIN_NAME: name,
    SEED_ADMIN_EMAIL: email,
    SEED_ADMIN_PASSWORD: password,
  } = process.env;
  if (
    !name ||
    !email ||
    !password ||
    password.length < 12 ||
    Buffer.byteLength(password, 'utf8') > 72
  )
    throw new Error(
      'Set SEED_ADMIN_NAME, SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (12+ characters, maximum 72 UTF-8 bytes).',
    );
  const hash = await bcrypt.hash(password, 12);
  await transaction(async (c) => {
    for (const [name, description] of categories)
      await c.execute(
        'INSERT INTO categories(name,description) VALUES (?,?) ON DUPLICATE KEY UPDATE description=VALUES(description)',
        [name, description],
      );
    const [existing] = await c.execute(
      'SELECT id,role FROM users WHERE email=?',
      [email.trim().toLowerCase()],
    );
    if (existing.length && existing[0].role !== 'admin')
      throw new Error(
        'Seed email belongs to a citizen; choose a different email.',
      );
    if (!existing.length)
      await c.execute(
        "INSERT INTO users(full_name,email,password_hash,role) VALUES (?,?,?,'admin')",
        [name, email.trim().toLowerCase(), hash],
      );
  });
  console.log(
    'Categories seeded; initial admin exists. Existing passwords are never overwritten.',
  );
} finally {
  await pool.end();
}
