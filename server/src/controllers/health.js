import { pool } from '../config/database.js';
import { ok } from '../utils/http.js';

export async function health(_req, res) {
  try {
    await pool.query('SELECT 1');
    ok(res, { api: 'ready', database: 'ready' }, 'Service is ready');
  } catch {
    res.status(503).json({
      success: false,
      message: 'The database connection is unavailable.',
      data: { api: 'ready', database: 'unavailable' },
    });
  }
}
