import { afterEach, describe, it, expect, vi } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useRequestActions } from './useRequestActions';
const { patch, post } = vi.hoisted(() => ({ patch: vi.fn(), post: vi.fn() }));
vi.mock('../services/api', () => ({
  api: { patch, post },
  message: () => 'Another administrator updated this request.',
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
describe('Administrator request actions', () => {
  it('submits the displayed version and refreshes the timeline on success', async () => {
    patch.mockResolvedValue({});
    const onUpdated = vi.fn();
    const { result } = renderHook(() =>
      useRequestActions({ id: 12, version: 3 }, onUpdated),
    );
    await act(async () => {
      expect(await result.current.save('Repair completed.', 'resolved')).toBe(
        true,
      );
    });
    expect(patch).toHaveBeenCalledWith('/admin/requests/12/status', {
      status: 'resolved',
      version: 3,
      note: 'Repair completed.',
    });
    expect(onUpdated).toHaveBeenCalledOnce();
    expect(result.current.success).toBe('Status updated successfully.');
    expect(result.current.busy).toBe(false);
  });
  it('retains a helpful conflict message and refreshes stale request data', async () => {
    patch.mockRejectedValue({ response: { status: 409 } });
    const onUpdated = vi.fn();
    const { result } = renderHook(() =>
      useRequestActions({ id: 12, version: 3 }, onUpdated),
    );
    await act(async () => {
      expect(await result.current.save('Repair completed.', 'resolved')).toBe(
        false,
      );
    });
    expect(result.current.error).toMatch(/Another administrator/);
    expect(result.current.success).toBe('');
    expect(onUpdated).toHaveBeenCalledOnce();
  });
});
