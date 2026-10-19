import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiErrorMessage } from './apiErrors';

afterEach(() => vi.restoreAllMocks());

describe('API failure feedback', () => {
  it('preserves useful validation messages from the API', () => {
    expect(
      apiErrorMessage({
        response: { status: 400, data: { message: 'Choose a category.' } },
      }),
    ).toBe('Choose a category.');
  });
  it('identifies proxy failures even when the response is HTML', () => {
    expect(
      apiErrorMessage({
        response: { status: 502, data: '<html>Bad Gateway</html>' },
      }),
    ).toContain('HTTP 502');
  });
  it.each(['ECONNABORTED', 'ETIMEDOUT'])('identifies a %s timeout', (code) => {
    expect(apiErrorMessage({ code })).toContain('too long to respond');
  });
  it('identifies offline connections', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    expect(apiErrorMessage({ code: 'ERR_NETWORK' })).toContain('offline');
  });
  it('does not claim an unknown network failure is necessarily the user’s connection', () => {
    expect(apiErrorMessage({ code: 'ERR_NETWORK' })).toContain(
      'server may be unavailable',
    );
  });
  it('distinguishes expired sessions and rate limiting', () => {
    expect(apiErrorMessage({ response: { status: 401 } })).toContain(
      'session has expired',
    );
    expect(apiErrorMessage({ response: { status: 429 } })).toContain(
      'Too many requests',
    );
  });
});
