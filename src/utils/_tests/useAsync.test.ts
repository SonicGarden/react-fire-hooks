import { setTimeout } from 'timers/promises';
import { renderHook, cleanup } from '@testing-library/react-hooks';
import { describe, afterEach, it, expect, vi } from 'vitest';
import { createDeferred } from '../../../tests/utils/async';
import { useAsync } from '../useAsync';

describe('useAsync', () => {
  afterEach(cleanup);

  it('should handle synchronous function', async () => {
    const fn = vi.fn(() => 42);
    const { result, waitFor } = renderHook(() => useAsync(fn));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(42);
    expect(result.current.error).toBe(null);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should wait for async function to complete before setting loading to false', async () => {
    const deferred = createDeferred<string>();
    const fn = vi.fn(() => deferred.promise);
    const { result, waitFor } = renderHook(() => useAsync(fn));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    await setTimeout(100);
    expect(result.current.loading).toBe(true);

    deferred.resolve('test data');
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe('test data');
    expect(result.current.error).toBe(null);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle errors correctly', async () => {
    const deferred = createDeferred<never>();
    const testError = new Error('test error');
    const fn = vi.fn(() => deferred.promise);
    const { result, waitFor } = renderHook(() => useAsync(fn));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    deferred.reject(testError);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(testError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should re-run when dependencies change', async () => {
    const fn = vi.fn().mockResolvedValueOnce(10).mockResolvedValueOnce(20);
    const { result, rerender, waitFor } = renderHook(({ deps }) => useAsync(fn, deps), {
      initialProps: { deps: [1] },
    });

    expect(result.current.loading).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(10);

    rerender({ deps: [2] });

    expect(result.current.loading).toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(20);
  });

  it('should not re-run when dependencies do not change', async () => {
    const fn = vi.fn().mockResolvedValueOnce(10).mockResolvedValueOnce(20);
    const { result, rerender, waitFor } = renderHook(({ deps }) => useAsync(fn, deps), {
      initialProps: { deps: [1, 2, 3] },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBe(10);

    rerender({ deps: [1, 2, 3] });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBe(10);
  });
});
