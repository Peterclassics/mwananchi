import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { app } from '../src/app.js';
describe('HTTP security boundaries without a database', () => {
  it('rejects unauthenticated list, details, images and admin analytics', async () => {
    for (const route of [
      '/api/requests',
      '/api/requests/1',
      '/api/requests/1/image',
      '/api/admin/analytics',
    ])
      expect((await supertest(app).get(route)).status).toBe(401);
  });
  it('requires CSRF for login and request creation', async () => {
    for (const route of ['/api/auth/login', '/api/requests'])
      expect((await supertest(app).post(route).send({})).status).toBe(403);
  });
  it('issues an HttpOnly CSRF cookie and validates supplied token', async () => {
    const agent = supertest.agent(app);
    const response = await agent.get('/api/auth/csrf');
    const token = response.body.data.csrfToken;
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
    const invalid = await agent
      .post('/api/auth/register')
      .set('X-CSRF-Token', token)
      .send({});
    expect(invalid.status).toBe(400);
    expect(invalid.body.fields.email).toBeTruthy();
  });
  it('rejects an unapproved origin even with a matching token', async () => {
    const agent = supertest.agent(app);
    const token = (await agent.get('/api/auth/csrf')).body.data.csrfToken;
    const response = await agent
      .post('/api/auth/logout')
      .set('X-CSRF-Token', token)
      .set('Origin', 'https://untrusted.example')
      .send({});
    expect(response.status).toBe(403);
  });
  it('returns safe JSON and security headers for missing endpoints', async () => {
    const response = await supertest(app).get('/api/nonexistent');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});
