import { cleanup, renderHook } from '@testing-library/react-hooks';
import { describe, afterEach, it, expect, vi, beforeAll } from 'vitest';
import { initializeTestApp } from '../../../tests/utils/firebase/app';
import { fruitRef } from '../../../tests/utils/firebase/firestore';
import { useRefsEffect } from '../useRefsEffect';

describe('useRefsEffect', () => {
  beforeAll(() => {
    initializeTestApp();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should not re-render if the ref content is the same', () => {
    const effect = vi.fn();
    const appleRef = fruitRef('apple');
    const { rerender } = renderHook(
      ({ refs }) => {
        useRefsEffect(effect, refs);
      },
      { initialProps: { refs: [appleRef] } },
    );

    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ refs: [appleRef] });
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('should re-render if the ref content is different', () => {
    const effect = vi.fn();
    const appleRef = fruitRef('apple');
    const bananaRef = fruitRef('banana');
    const { rerender } = renderHook(
      ({ refs }) => {
        useRefsEffect(effect, refs);
      },
      { initialProps: { refs: [appleRef] } },
    );

    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ refs: [bananaRef] });
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('should handle empty refs array', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(() => useRefsEffect(effect, []));

    expect(effect).toHaveBeenCalledTimes(1);

    rerender();
    expect(effect).toHaveBeenCalledTimes(1);
  });
});
