import { readFile, readdir } from 'node:fs/promises';
import { pool } from '../src/config/database.js';
export async function migrate() {
  const c = await pool.getConnection();
  try {
    const [[lock]] = await c.query(
      "SELECT GET_LOCK('hudumatrack_migrations',10) AS acquired",
    );
    if (!lock.acquired) throw new Error('Another migration is running');
    await c.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
    );
    const [done] = await c.query('SELECT name FROM schema_migrations');
    for (const name of (
      await readdir(new URL('./migrations/', import.meta.url))
    )
      .filter((n) => n.endsWith('.sql'))
      .sort()) {
      if (done.some((row) => row.name === name)) continue;
      const sql = await readFile(
        new URL(`./migrations/${name}`, import.meta.url),
        'utf8',
      );
      for (const statement of sql
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean))
        await c.query(statement);
      await c.execute('INSERT INTO schema_migrations(name) VALUES (?)', [name]);
      console.log(`Applied ${name}`);
    }
  } finally {
    await c.query("SELECT RELEASE_LOCK('hudumatrack_migrations')");
    c.release();
  }
}
if (process.argv[1]?.endsWith('migrate.js')) {
  try {
    await migrate();
  } finally {
    await pool.end();
  }
}
