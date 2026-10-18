import { afterEach, describe, it, expect, vi } from 'vitest';
import supertest from 'supertest';
const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('../src/config/database.js', () => ({ pool: { query } }));
import { app } from '../src/app.js';
afterEach(() => vi.resetAllMocks());
describe('Service readiness', () => {
  it('reports ready only after a successful database query', async () => {
    query.mockResolvedValue([[{ 1: 1 }]]);
    const response = await supertest(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ api: 'ready', database: 'ready' });
  });
  it('returns 503 without leaking database details', async () => {
    query.mockRejectedValue(new Error('password=should-not-be-exposed'));
    const response = await supertest(app).get('/api/health');
    expect(response.status).toBe(503);
    expect(response.body.data.database).toBe('unavailable');
    expect(JSON.stringify(response.body)).not.toContain(
      'should-not-be-exposed',
    );
  });
});
