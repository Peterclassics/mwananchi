import { app } from './app.js';
import { config } from './config/env.js';
import { pool } from './config/database.js';
await pool.query("SET time_zone = '+00:00'");
const server = app.listen(config.port, () =>
  console.log(`Mwananchi API listening on ${config.port}`),
);
async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
