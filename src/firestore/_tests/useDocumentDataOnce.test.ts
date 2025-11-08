import { setTimeout } from 'timers/promises';
import { cleanup, renderHook } from '@testing-library/react-hooks';
import { FirebaseError } from 'firebase/app';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { describe, beforeEach, afterEach, it, expect, beforeAll, vi } from 'vitest';
import { clearFirebase, initializeTestApp } from '../../../tests/utils/firebase/app';
import { animalsRef, fruitRef } from '../../../tests/utils/firebase/firestore';

describe('useDocumentDataOnce', async () => {
  const { useDocumentDataOnce } = await import('../useDocumentDataOnce');

  beforeAll(() => {
    initializeTestApp();
  });

  beforeEach(async () => {
    await Promise.all([setDoc(fruitRef('apple'), { name: 'apple' }), setDoc(fruitRef('banana'), { name: 'banana' })]);
  });

  afterEach(async () => {
    await Promise.all([clearFirebase(), cleanup(), vi.restoreAllMocks()]);
  });

  it('returns undefined while fetching data', () => {
    const { result } = renderHook(() => useDocumentDataOnce(fruitRef('apple')));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(undefined);
  });

  it('fetches data from the specified reference', async () => {
    const { result, waitFor } = renderHook(() => useDocumentDataOnce(fruitRef('apple')));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual({ name: 'apple' });
    });
  });

  it('returns undefined if the reference is null', () => {
    const { result } = renderHook(() => useDocumentDataOnce(null));
    expect(result.current.loading).toBe(undefined);
    expect(result.current.data).toBe(undefined);
  });

  it('fetches data only once when the reference changes', async () => {
    const { result, waitFor, rerender } = renderHook(({ ref }) => useDocumentDataOnce(ref), {
      initialProps: { ref: fruitRef('apple') },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual({ name: 'apple' });
    });

    rerender({ ref: fruitRef('banana') });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual({ name: 'banana' });
    });
  });

  it('clears data when the document reference changes to null', async () => {
    const { result, waitFor, rerender } = renderHook<
      { ref: Parameters<typeof useDocumentDataOnce>[0] | null },
      ReturnType<typeof useDocumentDataOnce>
    >(({ ref }) => useDocumentDataOnce(ref), { initialProps: { ref: fruitRef('apple') } });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toEqual({ name: 'apple' });
    rerender({ ref: null });
    await waitFor(() => {
      expect(result.current.loading).toBe(undefined);
      expect(result.current.data).toBe(undefined);
    });
  });

  it('does not refetch data when the data is updated', async () => {
    const { result, waitFor } = renderHook(() => useDocumentDataOnce(fruitRef('apple')));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual({ name: 'apple' });
    });

    await updateDoc(fruitRef('apple'), { color: 'red' });
    await setTimeout(1000);
    expect(result.current.data).toEqual({ name: 'apple' });
  });

  it('got an error when the query is invalid', async () => {
    const { result, waitFor } = renderHook(() => useDocumentDataOnce(doc(animalsRef(), 'cat'), { throwError: false }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(FirebaseError);
  });

  it('clears error when the document reference changes to null', async () => {
    const { result, waitFor, rerender } = renderHook(({ ref }) => useDocumentDataOnce(ref, { throwError: false }), {
      initialProps: { ref: doc(animalsRef(), 'cat') },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(FirebaseError);

    rerender({ ref: null });
    await waitFor(() => {
      expect(result.current.loading).toBe(undefined);
      expect(result.current.error).toBe(undefined);
    });
  });

  it('clears error when reference succeeds after error', async () => {
    const { result, waitFor, rerender } = renderHook(({ ref }) => useDocumentDataOnce(ref, { throwError: false }), {
      initialProps: { ref: doc(animalsRef(), 'cat') },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(FirebaseError);
    expect(result.current.data).toBe(undefined);

    rerender({ ref: fruitRef('apple') });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual({ name: 'apple' });
      expect(result.current.error).toBe(undefined);
    });
  });

  it('clears data when reference fails after success', async () => {
    const { result, waitFor, rerender } = renderHook(({ ref }) => useDocumentDataOnce(ref, { throwError: false }), {
      initialProps: { ref: fruitRef('apple') },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual({ name: 'apple' });
      expect(result.current.error).toBe(undefined);
    });

    rerender({ ref: doc(animalsRef(), 'cat') });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(undefined);
    expect(result.current.error).toBeInstanceOf(FirebaseError);
  });
});
