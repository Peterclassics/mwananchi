import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { pool } from '../server/src/config/database.js';
import sharp from 'sharp';

// Exercise real HTTP, Vite proxy, cookies, CSRF, MySQL and image storage with disposable fixtures.
const origin = process.env.FRONTEND_ORIGIN || 'http://localhost:5174';
const email = `smoke-${Date.now()}-${randomBytes(4).toString('hex')}@example.com`;
const password = randomBytes(16).toString('hex');
let requestId;
let imageKey;
function agent() {
  const cookies = new Map();
  let csrf;
  return async (method, path, body) => {
    if (!['GET', 'HEAD'].includes(method) && !csrf) {
      const result = await send('GET', '/auth/csrf');
      csrf = result.data.csrfToken;
    }
    return send(method, path, body);
    async function send(method, path, body) {
      const headers = {
        Origin: origin,
        Cookie: [...cookies]
          .map(([key, value]) => `${key}=${value}`)
          .join('; '),
      };
      if (csrf) headers['X-CSRF-Token'] = csrf;
      if (body && !(body instanceof FormData))
        headers['Content-Type'] = 'application/json';
      const response = await fetch(`${origin}/api${path}`, {
        method,
        headers,
        body:
          body instanceof FormData
            ? body
            : body
              ? JSON.stringify(body)
              : undefined,
      });
      for (const cookie of response.headers.getSetCookie()) {
        const pair = cookie.split(';')[0],
          equal = pair.indexOf('=');
        cookies.set(pair.slice(0, equal), pair.slice(equal + 1));
      }
      const text = await response.text();
      assert.ok(
        text &&
          response.headers.get('content-type')?.includes('application/json'),
        `${method} ${path} returned a non-JSON response (${response.status}); check the API process and Vite proxy.`,
      );
      const result = JSON.parse(text);
      assert.ok(
        response.ok,
        `${method} ${path} returned ${response.status}: ${result.message}`,
      );
      return result;
    }
  };
}
const citizen = agent(),
  admin = agent();
try {
  assert.equal((await citizen('GET', '/health')).data.database, 'ready');
  await citizen('POST', '/auth/register', {
    full_name: 'Disposable smoke-test citizen',
    email,
    password,
    confirm_password: password,
  });
  assert.equal((await citizen('GET', '/auth/me')).data.user.email, email);
  const category = (await citizen('GET', '/categories')).data[0];
  assert.ok(category, 'Seed categories before smoke testing.');
  const form = new FormData();
  for (const [key, value] of Object.entries({
    category_id: category.id,
    county: 'Nairobi',
    town_or_area: 'Smoke-test area',
    location_details: 'Disposable assessment fixture',
    description:
      'A disposable smoke test reporting a broken community streetlight for verification.',
  }))
    form.set(key, String(value));
  const png = await sharp({
    create: { width: 8, height: 8, channels: 3, background: '#127967' },
  })
    .png()
    .toBuffer();
  form.set('image', new Blob([png], { type: 'image/png' }), 'smoke.png');
  let request = (await citizen('POST', '/requests', form)).data;
  requestId = request.id;
  imageKey = request.image_storage_key;
  assert.equal(request.status, 'pending');
  await admin('POST', '/auth/login', {
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
  });
  request = (
    await admin('PATCH', `/admin/requests/${requestId}/status`, {
      status: 'in_progress',
      version: request.version,
      note: 'Smoke test: a crew is investigating.',
    })
  ).data;
  request = (
    await admin('PATCH', `/admin/requests/${requestId}/status`, {
      status: 'resolved',
      version: request.version,
      note: 'Smoke test: repair completed and verified.',
    })
  ).data;
  await citizen('POST', '/auth/logout');
  await citizen('POST', '/auth/login', { email, password });
  const restored = (await citizen('GET', `/requests/${requestId}`)).data;
  assert.equal(restored.status, 'resolved');
  assert.equal(restored.updates.length, 3);
  assert.ok(restored.resolved_at);
  const dashboard = (await citizen('GET', '/dashboard/citizen')).data;
  assert.equal(dashboard.total, 1);
  assert.equal(dashboard.resolved, 1);
  console.log(
    'LIVE SMOKE PASSED: registration, session restoration, image upload, admin transitions, timeline, login and dashboard through the Vite proxy.',
  );
} finally {
  if (!requestId) {
    const [rows] = await pool.execute(
      'SELECT r.id,r.image_storage_key FROM service_requests r JOIN users u ON u.id=r.citizen_id WHERE u.email=?',
      [email],
    );
    requestId = rows[0]?.id;
    imageKey = rows[0]?.image_storage_key;
  }
  if (requestId) {
    await pool.execute('DELETE FROM request_updates WHERE request_id=?', [
      requestId,
    ]);
    await pool.execute('DELETE FROM service_requests WHERE id=?', [requestId]);
  }
  await pool.execute('DELETE FROM users WHERE email=?', [email]);
  if (imageKey) {
    const { removeImage } = await import('../server/src/middleware/upload.js');
    await removeImage(imageKey);
  }
  await pool.end();
  console.log('Disposable smoke-test fixtures removed.');
}
