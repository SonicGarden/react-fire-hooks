import { renderHook, cleanup } from '@testing-library/react-hooks';
import { describe, afterEach, it, expect, vi } from 'vitest';
import { useCustomCompareEffect } from '../useCustomCompareEffect';
import type { DependencyList } from 'react';

const isEqual = (prevDeps: DependencyList, nextDeps: DependencyList) =>
  prevDeps.every((dep, index) => dep === nextDeps[index]);

describe('useCustomCompareEffect', () => {
  afterEach(cleanup);

  it('should call the effect when deps change and isEqual returns false', () => {
    const effect = vi.fn();
    const isEqual = vi.fn().mockReturnValue(false);
    const { rerender } = renderHook(({ deps }) => useCustomCompareEffect(effect, deps, isEqual), {
      initialProps: { deps: [1, 2, 3] },
    });
    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ deps: [1, 2, 4] });
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('should not call the effect when deps change but isEqual returns true', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(({ deps }) => useCustomCompareEffect(effect, deps, isEqual), {
      initialProps: { deps: [1, 2, 3] },
    });
    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ deps: [1, 2, 3] });
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('should handle empty deps array', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(() => useCustomCompareEffect(effect, [], isEqual));

    expect(effect).toHaveBeenCalledTimes(1);

    rerender();
    expect(effect).toHaveBeenCalledTimes(1);
  });
});
