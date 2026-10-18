import { afterEach, describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act, cleanup } from '@testing-library/react';
import { useApi } from './useApi';
const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('../services/api', () => ({
  api: { get },
  message: () => 'Unable to load requests.',
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
describe('API loading across screens and refreshes', () => {
  it('does not expose the previous request when the URL changes', async () => {
    get.mockResolvedValueOnce({ data: { data: { id: 1 } } });
    const { result, rerender } = renderHook(({ url }) => useApi(url), {
      initialProps: { url: '/requests/1' },
    });
    await waitFor(() => expect(result.current.data?.id).toBe(1));
    let finish;
    get.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    rerender({ url: '/requests/2' });
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    await act(async () => finish({ data: { data: { id: 2 } } }));
    expect(result.current.data.id).toBe(2);
  });
  it('keeps current data during a refresh and clears it after a failure', async () => {
    get.mockResolvedValueOnce({ data: { data: { id: 1 } } });
    const { result } = renderHook(() => useApi('/requests/1'));
    await waitFor(() => expect(result.current.data?.id).toBe(1));
    let fail;
    get.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          fail = reject;
        }),
    );
    act(() => result.current.reload());
    expect(result.current.data.id).toBe(1);
    expect(result.current.loading).toBe(true);
    await act(async () => fail(new Error('offline')));
    expect(result.current.error).toBe('Unable to load requests.');
    expect(result.current.data).toBeNull();
  });
});
