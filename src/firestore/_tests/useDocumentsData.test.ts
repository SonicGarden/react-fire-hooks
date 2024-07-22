import { cleanup, renderHook } from '@testing-library/react-hooks';
import { setDoc, updateDoc } from 'firebase/firestore';
import { describe, beforeEach, afterEach, it, expect, beforeAll, vi } from 'vitest';
import { clearFirebase, initializeTestApp } from '../../../tests/utils/firebase/app';
import { fruitRef } from '../../../tests/utils/firebase/firestore';

describe('useDocumentsData', async () => {
  const { useDocumentsData } = await import('../useDocumentsData');

  beforeAll(() => {
    initializeTestApp();
  });

  beforeEach(async () => {
    await Promise.all([
      setDoc(fruitRef('apple'), { name: 'apple' }),
      setDoc(fruitRef('banana'), { name: 'banana' }),
      setDoc(fruitRef('orange'), { name: 'orange' }),
    ]);
  });

  afterEach(async () => {
    await Promise.all([clearFirebase(), cleanup(), vi.restoreAllMocks()]);
  });

  it('returns an empty array while fetching data', () => {
    const { result } = renderHook(() => useDocumentsData([fruitRef('apple'), fruitRef('banana')]));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('fetches data from the specified references', async () => {
    const { result, waitFor } = renderHook(() => useDocumentsData([fruitRef('apple'), fruitRef('banana')]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual([{ name: 'apple' }, { name: 'banana' }]);
    });
  });

  it('returns an empty array if refs is empty', () => {
    const { result } = renderHook(() => useDocumentsData([]));
    expect(result.current.loading).toBe(undefined);
    expect(result.current.data).toEqual([]);
  });

  it('returns undefined if refs is null', () => {
    const { result } = renderHook(() => useDocumentsData(null));
    expect(result.current.loading).toBe(undefined);
    expect(result.current.data).toEqual([]);
  });

  it('refetches data when the references change', async () => {
    const { result, waitFor, rerender } = renderHook(({ refs }) => useDocumentsData(refs), {
      initialProps: { refs: [fruitRef('apple'), fruitRef('banana')] },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual([{ name: 'apple' }, { name: 'banana' }]);
    });

    rerender({ refs: [fruitRef('banana'), fruitRef('orange')] });
    await waitFor(() => expect(result.current.loading).toBe(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual([{ name: 'banana' }, { name: 'orange' }]);
    });
  });

  it('refetches data when the data is updated', async () => {
    const { result, waitFor } = renderHook(() => useDocumentsData([fruitRef('apple'), fruitRef('banana')]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual([{ name: 'apple' }, { name: 'banana' }]);
    });

    await updateDoc(fruitRef('apple'), { color: 'red' });
    await waitFor(() => {
      expect(result.current.data).toEqual([{ name: 'apple', color: 'red' }, { name: 'banana' }]);
    });
  });
});
