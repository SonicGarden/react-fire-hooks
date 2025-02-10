import { cleanup, renderHook } from '@testing-library/react-hooks';
import { FirebaseError } from 'firebase/app';
import { doc, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { describe, beforeEach, afterEach, it, expect, beforeAll, vi } from 'vitest';
import { clearFirebase, initializeTestApp } from '../../../tests/utils/firebase/app';
import { animalsRef, fruitRef } from '../../../tests/utils/firebase/firestore';

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

  it('returns an empty array if refs is empty array', () => {
    const { result } = renderHook(() => useDocumentsData([]));
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

  it('clears data when the references change to empty array', async () => {
    const { result, waitFor, rerender } = renderHook(({ refs }) => useDocumentsData(refs), {
      initialProps: { refs: [fruitRef('apple'), fruitRef('banana')] },
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toEqual([{ name: 'apple' }, { name: 'banana' }]);
    rerender({ refs: [] });
    await waitFor(() => {
      expect(result.current.data).toEqual([]);
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

  it('returns a Timestamp object for server timestamps when serverTimestamps is set to "estimate"', async () => {
    const { result, waitFor } = renderHook(() =>
      useDocumentsData([fruitRef('apple')], { snapshotOptions: { serverTimestamps: 'estimate' } }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual([{ name: 'apple' }]);
    });

    await updateDoc(fruitRef('apple'), { updatedAt: serverTimestamp() });
    await waitFor(() => {
      expect(result.current.data?.find((_) => _?.name === 'apple')?.updatedAt).toBeInstanceOf(Timestamp);
    });
  });

  it('returns null for server timestamps when snapshotOptions is not specified', async () => {
    const { result, waitFor } = renderHook(() => useDocumentsData([fruitRef('apple')]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual([{ name: 'apple' }]);
    });

    await updateDoc(fruitRef('apple'), { updatedAt: serverTimestamp() });
    await waitFor(() => {
      expect(result.current.data?.find((_) => _?.name === 'apple')?.updatedAt).toBe(null);
    });
  });

  it('got an error when the query is invalid', async () => {
    const { result, waitFor } = renderHook(() => useDocumentsData([doc(animalsRef(), 'cat')], { throwError: false }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.errors?.[0]).toBeInstanceOf(FirebaseError);
  });
});
