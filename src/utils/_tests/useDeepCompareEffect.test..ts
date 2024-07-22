import { renderHook, cleanup } from '@testing-library/react-hooks';
import { describe, afterEach, it, expect, vi } from 'vitest';
import { useDeepCompareEffect } from '../useDeepCompareEffect';

describe('useDeepCompareEffect', () => {
  afterEach(cleanup);

  it('should call the effect when deps change shallowly', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(({ deps }) => useDeepCompareEffect(effect, deps), {
      initialProps: { deps: [1, 2, 3] },
    });

    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ deps: [1, 2, 4] });
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('should call the effect when deps change deeply', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(({ deps }) => useDeepCompareEffect(effect, deps), {
      initialProps: { deps: [{ a: 1, b: 2, c: { d: 3 } }] },
    });

    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ deps: [{ a: 1, b: 2, c: { d: 4 } }] });
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('should not call the effect when deps do not change', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(({ deps }) => useDeepCompareEffect(effect, deps), {
      initialProps: { deps: [{ a: 1, b: 2, c: { d: 3 } }] },
    });

    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ deps: [{ a: 1, b: 2, c: { d: 3 } }] });
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('should handle empty deps array', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(() => useDeepCompareEffect(effect, []));

    expect(effect).toHaveBeenCalledTimes(1);

    rerender();
    expect(effect).toHaveBeenCalledTimes(1);
  });
});
