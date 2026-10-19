import { describe, expect, it } from 'vitest';
import { getApiBaseUrl } from './apiConfig';

describe('API URL selection', () => {
  it('uses the local proxy in development even with a hosted URL configured', () => {
    expect(
      getApiBaseUrl({
        DEV: true,
        VITE_API_BASE_URL: 'https://example.com/api',
      }),
    ).toBe('/api');
  });
  it('uses the hosted backend in production and removes trailing slashes', () => {
    expect(
      getApiBaseUrl({
        DEV: false,
        VITE_API_BASE_URL: ' https://example.com/api/ ',
      }),
    ).toBe('https://example.com/api');
  });
  it('supports a same-origin production proxy when no domain is configured', () => {
    expect(getApiBaseUrl({ DEV: false })).toBe('/api');
  });
});
