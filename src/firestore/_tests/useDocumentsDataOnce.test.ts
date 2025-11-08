import { setTimeout } from 'timers/promises';
import { cleanup, renderHook } from '@testing-library/react-hooks';
import { FirebaseError } from 'firebase/app';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { describe, beforeEach, afterEach, it, expect, beforeAll, vi } from 'vitest';
import { clearFirebase, initializeTestApp } from '../../../tests/utils/firebase/app';
import { animalsRef, fruitRef } from '../../../tests/utils/firebase/firestore';

describe('useDocumentsDataOnce', async () => {
  const { useDocumentsDataOnce } = await import('../useDocumentsDataOnce');

  beforeAll(() => {
    initializeTestApp();
  });

  beforeEach(async () => {
    await Promise.all([
      setDoc(fruitRef('apple'), { name: 'apple' }),
      setDoc(fruitRef('banana'), { name: 'banana' }),
      setDoc(fruitRef('cherry'), { name: 'cherry' }),
    ]);
  });

  afterEach(async () => {
    await Promise.all([clearFirebase(), cleanup(), vi.restoreAllMocks()]);
  });

  it('returns an empty array while fetching data', () => {
    const { result } = renderHook(() => useDocumentsDataOnce([fruitRef('apple'), fruitRef('banana')]));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('fetches data from the specified references', async () => {
    const { result, waitFor } = renderHook(() => useDocumentsDataOnce([fruitRef('apple'), fruitRef('banana')]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual([{ name: 'apple' }, { name: 'banana' }]);
    });
  });

  it('returns an empty array if the references array is empty', () => {
    const { result } = renderHook(() => useDocumentsDataOnce([]));
    expect(result.current.loading).toBe(undefined);
    expect(result.current.data).toEqual([]);
  });

  it('fetches data only once when the references array changes', async () => {
    const { result, waitFor, rerender } = renderHook(({ refs }) => useDocumentsDataOnce(refs), {
      initialProps: { refs: [fruitRef('apple'), fruitRef('banana')] },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual([{ name: 'apple' }, { name: 'banana' }]);
    });

    rerender({ refs: [fruitRef('banana'), fruitRef('cherry')] });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual([{ name: 'banana' }, { name: 'cherry' }]);
    });
  });

  it('clears data when the references change to empty array', async () => {
    const { result, waitFor, rerender } = renderHook(({ refs }) => useDocumentsDataOnce(refs), {
      initialProps: { refs: [fruitRef('apple'), fruitRef('banana')] },
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toEqual([{ name: 'apple' }, { name: 'banana' }]);
    rerender({ refs: [] });
    await waitFor(() => {
      expect(result.current.loading).toBe(undefined);
      expect(result.current.data).toEqual([]);
    });
  });

  it('does not refetch data when the data is updated', async () => {
    const { result, waitFor } = renderHook(() => useDocumentsDataOnce([fruitRef('apple'), fruitRef('banana')]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual([{ name: 'apple' }, { name: 'banana' }]);
    });

    await updateDoc(fruitRef('apple'), { color: 'red' });
    await setTimeout(1000);
    expect(result.current.data).toEqual([{ name: 'apple' }, { name: 'banana' }]);
  });

  it('got an error when the query is invalid', async () => {
    const { result, waitFor } = renderHook(() =>
      useDocumentsDataOnce([doc(animalsRef(), 'cat')], { throwError: false }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.errors?.[0]).toBeInstanceOf(FirebaseError);
  });

  it('clears errors when the references change to empty array', async () => {
    const { result, waitFor, rerender } = renderHook(({ refs }) => useDocumentsDataOnce(refs, { throwError: false }), {
      initialProps: { refs: [doc(animalsRef(), 'cat')] },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.errors?.length).toBeGreaterThan(0);

    rerender({ refs: [] });
    await waitFor(() => {
      expect(result.current.loading).toBe(undefined);
      expect(result.current.errors).toEqual([]);
    });
  });
});
