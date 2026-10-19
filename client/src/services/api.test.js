import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => vi.resetModules());

it('shares the CSRF fetch across concurrent writes and allows longer write timeouts', async () => {
  const { api } = await import('./api');
  let resolveToken;
  const tokenReady = new Promise((resolve) => {
    resolveToken = resolve;
  });
  const adapter = vi.fn(async (config) => {
    if (config.url === '/auth/csrf') {
      await tokenReady;
      return {
        data: { data: { csrfToken: 'test-token' } },
        status: 200,
        headers: {},
        config,
      };
    }
    expect(config.timeout).toBe(60000);
    expect(config.headers.get('X-CSRF-Token')).toBe('test-token');
    return { data: {}, status: 200, headers: {}, config };
  });
  api.defaults.adapter = adapter;
  const writes = Promise.all([
    api.post('/requests', {}),
    api.patch('/admin/requests/1/status', {}),
  ]);
  await vi.waitFor(() => expect(adapter).toHaveBeenCalledTimes(1));
  resolveToken();
  await writes;
  expect(
    adapter.mock.calls.filter(([config]) => config.url === '/auth/csrf'),
  ).toHaveLength(1);
  expect(adapter).toHaveBeenCalledTimes(3);
});

it('does not automatically replay a write when the response times out', async () => {
  const { api } = await import('./api');
  const adapter = vi.fn(async (config) => {
    if (config.url === '/auth/csrf')
      return {
        data: { data: { csrfToken: 'test-token' } },
        status: 200,
        headers: {},
        config,
      };
    throw Object.assign(new Error('timeout'), { code: 'ECONNABORTED', config });
  });
  api.defaults.adapter = adapter;
  await expect(api.post('/requests', {})).rejects.toMatchObject({
    code: 'ECONNABORTED',
  });
  expect(
    adapter.mock.calls.filter(([config]) => config.url === '/requests'),
  ).toHaveLength(1);
});
