import { cleanup, renderHook } from '@testing-library/react-hooks';
import { query, where } from 'firebase/firestore';
import { describe, afterEach, it, expect, vi, beforeAll } from 'vitest';
import { clearFirebase, initializeTestApp } from '../../../tests/utils/firebase/app';
import { fruitsRef } from '../../../tests/utils/firebase/firestore';

describe('useQueriesEffect', async () => {
  const { useQueriesEffect } = await import('../useQueriesEffect');

  beforeAll(() => {
    initializeTestApp();
  });

  afterEach(async () => {
    await Promise.all([clearFirebase(), cleanup(), vi.restoreAllMocks()]);
  });

  it('should not re-render if the query content is the same', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(
      ({ queries }) => {
        useQueriesEffect(effect, queries);
      },
      { initialProps: { queries: [query(fruitsRef())] } },
    );

    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ queries: [query(fruitsRef())] });
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('should re-render if the query content is different', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(
      ({ queries }) => {
        useQueriesEffect(effect, queries);
      },
      { initialProps: { queries: [query(fruitsRef())] } },
    );

    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ queries: [query(fruitsRef(), where('name', '==', 'apple'))] });
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('should handle empty queries array', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(() => useQueriesEffect(effect, []));

    expect(effect).toHaveBeenCalledTimes(1);

    rerender();
    expect(effect).toHaveBeenCalledTimes(1);
  });
});
