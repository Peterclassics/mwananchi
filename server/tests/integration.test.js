import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import supertest from 'supertest';
import bcrypt from 'bcrypt';
import sharp from 'sharp';
import { app } from '../src/app.js';
import { pool } from '../src/config/database.js';
import { migrate } from '../database/migrate.js';
import { removeImage } from '../src/middleware/upload.js';

// Fail closed: never reset, migrate or write to the normal application database.
if (!process.env.DB_NAME?.endsWith('_test'))
  throw new Error(
    'Integration tests require DB_NAME ending in _test, configured in server/.env.test.',
  );
const run = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const email = `citizen-${run}@example.com`,
  adminEmail = `admin-${run}@example.com`;
const citizen = supertest.agent(app),
  other = supertest.agent(app),
  admin = supertest.agent(app);
let citizenCsrf,
  otherCsrf,
  adminCsrf,
  requestId,
  categoryId,
  userId,
  adminId,
  imageKey,
  png;
const userInput = {
  full_name: 'Assessment Citizen',
  email,
  password: 'test-password-123',
  confirm_password: 'test-password-123',
  role: 'admin',
};
async function token(agent) {
  return (await agent.get('/api/auth/csrf')).body.data.csrfToken;
}
const write = (agent, method, url, csrf) =>
  agent[method](url)
    .set('X-CSRF-Token', csrf)
    .set('Origin', process.env.FRONTEND_ORIGIN || 'http://localhost:5174');
const requestData = () => ({
  category_id: categoryId,
  county: 'Nairobi',
  town_or_area: 'Kilimani',
  location_details: `Integration landmark ${run}`,
  description: `The streetlight outside our community library has been broken for three evenings. ${run}`,
});
beforeAll(async () => {
  await migrate();
  citizenCsrf = await token(citizen);
  otherCsrf = await token(other);
  adminCsrf = await token(admin);
  const [cat] = await pool.execute(
    'INSERT INTO categories(name,description) VALUES (?,?)',
    [`Test category ${run}`, 'Integration test only'],
  );
  categoryId = cat.insertId;
  const [a] = await pool.execute(
    "INSERT INTO users(full_name,email,password_hash,role) VALUES (?,?,?,'admin')",
    ['Assessment Admin', adminEmail, await bcrypt.hash('test-password-123', 4)],
  );
  adminId = a.insertId;
  png = await sharp({
    create: { width: 8, height: 8, channels: 3, background: '#147b68' },
  })
    .png()
    .toBuffer();
}, 30000);
afterAll(async () => {
  // Delete only rows belonging to this run, in foreign-key order.
  if (categoryId) {
    await pool.execute(
      'DELETE FROM request_updates WHERE request_id IN (SELECT id FROM service_requests WHERE category_id=?)',
      [categoryId],
    );
    await pool.execute('DELETE FROM service_requests WHERE category_id=?', [
      categoryId,
    ]);
    await pool.execute('DELETE FROM categories WHERE id=?', [categoryId]);
  }
  await pool.execute('DELETE FROM users WHERE email IN (?,?,?)', [
    email,
    adminEmail,
    `other-${run}@example.com`,
  ]);
  if (imageKey) await removeImage(imageKey);
  await pool.end();
});
// Tests in this suite run in declaration order and share a single workflow.
describe('MySQL API workflows', () => {
  it('registers only a citizen and does not expose hashes', async () => {
    const r = await write(
      citizen,
      'post',
      '/api/auth/register',
      citizenCsrf,
    ).send(userInput);
    expect(r.status).toBe(201);
    expect(r.body.data.user.role).toBe('citizen');
    expect(r.body.data.user.password_hash).toBeUndefined();
    userId = r.body.data.user.id;
    expect(r.headers['set-cookie'].some((c) => c.includes('HttpOnly'))).toBe(
      true,
    );
  });
  it('rejects duplicate normalised email', async () => {
    const r = await write(other, 'post', '/api/auth/register', otherCsrf).send({
      ...userInput,
      email: email.toUpperCase(),
    });
    expect(r.status).toBe(409);
  });
  it('rejects incorrect credentials and permits correct credentials', async () => {
    expect(
      (
        await write(other, 'post', '/api/auth/login', otherCsrf).send({
          email,
          password: 'wrong',
        })
      ).status,
    ).toBe(401);
    expect(
      (
        await write(citizen, 'post', '/api/auth/login', citizenCsrf).send({
          email,
          password: userInput.password,
        })
      ).status,
    ).toBe(200);
    expect((await citizen.get('/api/auth/me')).body.data.user.id).toBe(userId);
  });
  it('denies anonymous users, citizen admin access, and writes without CSRF', async () => {
    expect((await supertest(app).get('/api/requests')).status).toBe(401);
    expect((await citizen.get('/api/admin/analytics')).status).toBe(403);
    expect(
      (await citizen.post('/api/requests').send(requestData())).status,
    ).toBe(403);
  });
  it('creates a pending request with a real image and server-owned fields', async () => {
    let req = write(citizen, 'post', '/api/requests', citizenCsrf);
    for (const [key, value] of Object.entries({
      ...requestData(),
      citizen_id: adminId,
      status: 'resolved',
      reference_number: 'FORGED',
    }))
      req = req.field(key, String(value));
    const r = await req.attach('image', png, {
      filename: 'issue.png',
      contentType: 'image/png',
    });
    expect(r.status).toBe(201);
    expect(r.body.data.status).toBe('pending');
    expect(r.body.data.citizen_id).toBe(userId);
    expect(r.body.data.reference_number).toMatch(/^HT-\d{4}-\d{6,}$/);
    expect(r.body.data.updates[0].event_type).toBe('created');
    requestId = r.body.data.id;
    imageKey = r.body.data.image_storage_key;
  });
  it('rejects invalid categories and descriptions', async () => {
    expect(
      (
        await write(citizen, 'post', '/api/requests', citizenCsrf).send({
          ...requestData(),
          description: 'short',
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await write(citizen, 'post', '/api/requests', citizenCsrf).send({
          ...requestData(),
          category_id: 2147483647,
        })
      ).status,
    ).toBe(400);
  });
  it('rejects spoofed, undecodable and oversized uploads', async () => {
    for (const buffer of [
      Buffer.from('not an image'),
      Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        Buffer.alloc(30),
      ]),
    ]) {
      const r = await write(citizen, 'post', '/api/requests', citizenCsrf)
        .field('category_id', String(categoryId))
        .field('county', 'Nairobi')
        .field('town_or_area', 'CBD')
        .field('location_details', 'Main street')
        .field(
          'description',
          'A long enough issue description for upload validation.',
        )
        .attach('image', buffer, {
          filename: 'fake.png',
          contentType: 'image/png',
        });
      expect(r.status).toBe(400);
    }
    const r = await write(citizen, 'post', '/api/requests', citizenCsrf).attach(
      'image',
      Buffer.alloc(5242881),
      { filename: 'huge.png', contentType: 'image/png' },
    );
    expect(r.status).toBe(400);
  });
  it('enforces ownership on listing, details and images', async () => {
    await write(other, 'post', '/api/auth/register', otherCsrf).send({
      ...userInput,
      email: `other-${run}@example.com`,
    });
    expect((await other.get('/api/requests')).body.data).toHaveLength(0);
    expect((await other.get(`/api/requests/${requestId}`)).status).toBe(404);
    expect((await other.get(`/api/requests/${requestId}/image`)).status).toBe(
      404,
    );
    expect(
      (await citizen.get(`/api/requests/${requestId}/image`)).headers[
        'content-type'
      ],
    ).toMatch(/image\/webp/);
  });
  it('combines search, category, status, dates and pagination', async () => {
    await write(citizen, 'post', '/api/requests', citizenCsrf).send({
      ...requestData(),
      description: `Another broken streetlight affecting our neighbourhood. ${run}`,
    });
    const r = await citizen.get('/api/requests').query({
      search: run,
      category: categoryId,
      status: 'pending',
      from: '2020-01-01',
      to: '2099-12-31',
      page_size: 1,
      page: 2,
    });
    expect(r.status).toBe(200);
    expect(r.body.pagination.total).toBe(2);
    expect(r.body.data).toHaveLength(1);
    expect((await citizen.get('/api/requests?page_size=1000')).status).toBe(
      400,
    );
  });
  it('logs in an administrator and rejects skipped transitions', async () => {
    expect(
      (
        await write(admin, 'post', '/api/auth/login', adminCsrf).send({
          email: adminEmail,
          password: 'test-password-123',
        })
      ).status,
    ).toBe(200);
    const r = await write(
      admin,
      'patch',
      `/api/admin/requests/${requestId}/status`,
      adminCsrf,
    ).send({ status: 'resolved', version: 1, note: 'Repair completed' });
    expect(r.status).toBe(409);
  });
  it('records valid transition and rejects stale concurrent changes', async () => {
    const r = await write(
      admin,
      'patch',
      `/api/admin/requests/${requestId}/status`,
      adminCsrf,
    ).send({
      status: 'in_progress',
      version: 1,
      note: 'A technician is investigating.',
    });
    expect(r.status).toBe(200);
    expect(r.body.data.version).toBe(2);
    const event = r.body.data.updates.at(-1);
    expect(event.previous_status).toBe('pending');
    expect(event.new_status).toBe('in_progress');
    expect(event.actor_id).toBe(adminId);
    expect(
      (
        await write(
          admin,
          'patch',
          `/api/admin/requests/${requestId}/status`,
          adminCsrf,
        ).send({ status: 'resolved', version: 1, note: 'Stale update' })
      ).status,
    ).toBe(409);
  });
  it('requires resolution note and records resolution date', async () => {
    expect(
      (
        await write(
          admin,
          'patch',
          `/api/admin/requests/${requestId}/status`,
          adminCsrf,
        ).send({ status: 'resolved', version: 2, note: '' })
      ).status,
    ).toBe(400);
    const r = await write(
      admin,
      'patch',
      `/api/admin/requests/${requestId}/status`,
      adminCsrf,
    ).send({
      status: 'resolved',
      version: 2,
      note: 'The lamp has been replaced and tested.',
    });
    expect(r.status).toBe(200);
    expect(r.body.data.resolved_at).toBeTruthy();
    expect(r.body.data.updates).toHaveLength(3);
  });
  it('publishes public notes and protects admin images', async () => {
    const r = await write(
      admin,
      'post',
      `/api/admin/requests/${requestId}/updates`,
      adminCsrf,
    ).send({ note: 'Thank you for reporting this issue.' });
    expect(r.status).toBe(200);
    expect(
      (await citizen.get(`/api/requests/${requestId}`)).body.data.updates.at(-1)
        .note,
    ).toMatch(/Thank you/);
    expect((await admin.get(`/api/requests/${requestId}/image`)).status).toBe(
      200,
    );
  });
  it('matches analytics with MySQL totals and citizen scope', async () => {
    const r = await admin.get('/api/admin/analytics');
    const [[counts]] = await pool.query(
      "SELECT COUNT(*) AS total,SUM(status='resolved') AS resolved FROM service_requests",
    );
    expect(r.body.data.total).toBe(Number(counts.total));
    expect(r.body.data.resolved).toBe(Number(counts.resolved));
    expect(r.body.data.open).toBe(
      r.body.data.pending + r.body.data.in_progress,
    );
    const mine = (await citizen.get('/api/dashboard/citizen')).body.data;
    expect(mine.total).toBe(2);
    expect(mine.resolved).toBe(1);
  });
  it('updates personal details while rejecting email and role changes', async () => {
    const denied = await write(
      citizen,
      'patch',
      '/api/account/profile',
      citizenCsrf,
    ).send({
      full_name: 'Changed Citizen',
      email: 'changed@example.com',
      role: 'admin',
    });
    expect(denied.status).toBe(400);
    const invalid = await write(
      citizen,
      'patch',
      '/api/account/profile',
      citizenCsrf,
    ).send({ full_name: ' ', phone: 'abc' });
    expect(invalid.status).toBe(400);
    expect(invalid.body.fields.phone).toBeTruthy();
    const saved = await write(
      citizen,
      'patch',
      '/api/account/profile',
      citizenCsrf,
    ).send({ full_name: 'Updated Assessment Citizen', phone: '+254712345678' });
    expect(saved.status).toBe(200);
    expect(saved.body.data.user.email).toBe(email);
    expect(saved.body.data.user.role).toBe('citizen');
    expect(saved.body.data.user.full_name).toBe('Updated Assessment Citizen');
    expect(saved.body.data.user.session_version).toBeUndefined();
    expect((await citizen.get('/api/auth/me')).body.data.user.phone).toBe(
      '+254712345678',
    );
    const cleared = await write(
      citizen,
      'patch',
      '/api/account/profile',
      citizenCsrf,
    ).send({ full_name: 'Updated Assessment Citizen', phone: '' });
    expect(cleared.body.data.user.phone).toBeNull();
  });
  it('rejects incorrect current passwords, mismatches and reused passwords', async () => {
    for (const data of [
      {
        current_password: 'wrong-password',
        new_password: 'new-valid-password',
        confirm_password: 'new-valid-password',
      },
      {
        current_password: userInput.password,
        new_password: 'new-valid-password',
        confirm_password: 'different',
      },
      {
        current_password: userInput.password,
        new_password: userInput.password,
        confirm_password: userInput.password,
      },
    ])
      expect(
        (
          await write(
            citizen,
            'post',
            '/api/account/password',
            citizenCsrf,
          ).send(data)
        ).status,
      ).toBe(400);
    expect((await citizen.get('/api/auth/me')).status).toBe(200);
  });
  it('changes the password, preserves this session and invalidates other sessions', async () => {
    const second = supertest.agent(app);
    const secondCsrf = await token(second);
    await write(second, 'post', '/api/auth/login', secondCsrf).send({
      email,
      password: userInput.password,
    });
    const updated = 'updated-assessment-password-123';
    const response = await write(
      citizen,
      'post',
      '/api/account/password',
      citizenCsrf,
    ).send({
      current_password: userInput.password,
      new_password: updated,
      confirm_password: updated,
    });
    expect(response.status).toBe(200);
    expect((await citizen.get('/api/auth/me')).status).toBe(200);
    expect((await second.get('/api/auth/me')).status).toBe(401);
    expect(
      (
        await write(second, 'post', '/api/auth/login', secondCsrf).send({
          email,
          password: userInput.password,
        })
      ).status,
    ).toBe(401);
    expect(
      (
        await write(second, 'post', '/api/auth/login', secondCsrf).send({
          email,
          password: updated,
        })
      ).status,
    ).toBe(200);
  });
  it('allows admins to edit their own contact details without changing their role', async () => {
    const response = await write(
      admin,
      'patch',
      '/api/account/profile',
      adminCsrf,
    ).send({ full_name: 'Updated Assessment Admin', phone: '+254700123456' });
    expect(response.status).toBe(200);
    expect(response.body.data.user.role).toBe('admin');
    expect(response.body.data.user.email).toBe(adminEmail);
  });
  it('exports all filtered records and clears logout cookies', async () => {
    const r = await admin
      .get('/api/admin/requests/export')
      .query({ category: categoryId, search: run, page_size: 1 });
    expect(r.status).toBe(200);
    expect(r.text.split('\r\n').filter(Boolean)).toHaveLength(3);
    expect(
      (await write(citizen, 'post', '/api/auth/logout', citizenCsrf)).status,
    ).toBe(200);
    expect((await citizen.get('/api/auth/me')).status).toBe(401);
  });
});
