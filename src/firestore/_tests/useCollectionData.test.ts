import { cleanup, renderHook } from '@testing-library/react-hooks';
import { FirebaseError } from 'firebase/app';
import { addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { describe, beforeEach, afterEach, it, expect, beforeAll, vi } from 'vitest';
import { clearFirebase, initializeTestApp } from '../../../tests/utils/firebase/app';
import { animalsRef, fruitsRef, vegetablesRef } from '../../../tests/utils/firebase/firestore';

describe('useCollectionData', async () => {
  const { useCollectionData } = await import('../useCollectionData');

  beforeAll(() => {
    initializeTestApp();
  });

  beforeEach(async () => {
    await Promise.all([
      addDoc(fruitsRef(), { name: 'apple' }),
      addDoc(fruitsRef(), { name: 'banana' }),
      addDoc(vegetablesRef(), { name: 'carrot' }),
      addDoc(vegetablesRef(), { name: 'potato' }),
    ]);
  });

  afterEach(async () => {
    await Promise.all([clearFirebase(), cleanup(), vi.restoreAllMocks()]);
  });

  it('returns an empty array while fetching data', () => {
    const { result } = renderHook(() => useCollectionData(fruitsRef()));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('fetches data from the specified query', async () => {
    const { result, waitFor } = renderHook(() => useCollectionData(fruitsRef()));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data.length).toBe(2);
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'apple' }));
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'banana' }));
    });
  });

  it('returns an empty array if the query is null', () => {
    const { result } = renderHook(() => useCollectionData(null));
    expect(result.current.loading).toBe(undefined);
    expect(result.current.data).toEqual([]);
  });

  it('refetches data when the query changes', async () => {
    const { result, waitFor, rerender } = renderHook(({ ref }) => useCollectionData(ref), {
      initialProps: { ref: fruitsRef() },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data.length).toBe(2);
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'apple' }));
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'banana' }));
    });

    rerender({ ref: vegetablesRef() });
    await waitFor(() => expect(result.current.loading).toBe(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data.length).toBe(2);
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'carrot' }));
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'potato' }));
    });
  });

  it('refetches data when the data is updated', async () => {
    const { result, waitFor } = renderHook(() => useCollectionData(fruitsRef()));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data.length).toBe(2);
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'apple' }));
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'banana' }));
    });

    await addDoc(fruitsRef(), { name: 'cherry' });
    await waitFor(() => {
      expect(result.current.data.length).toBe(3);
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'cherry' }));
    });
  });

  it('returns a Timestamp object for server timestamps when serverTimestamps is set to "estimate"', async () => {
    const { result, waitFor } = renderHook(() =>
      useCollectionData(fruitsRef(), { snapshotOptions: { serverTimestamps: 'estimate' } }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    await addDoc(fruitsRef(), { name: 'cherry', createdAt: serverTimestamp() });

    await waitFor(() => {
      expect(result.current.data.length).toBe(3);
      expect(result.current.data.find(({ name }) => name === 'cherry')?.createdAt).toBeInstanceOf(Timestamp);
    });
  });

  it('returns null for server timestamps when snapshotOptions is not specified', async () => {
    const { result, waitFor } = renderHook(() => useCollectionData(fruitsRef()));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await addDoc(fruitsRef(), { name: 'cherry', createdAt: serverTimestamp() });

    await waitFor(() => {
      expect(result.current.data.length).toBe(3);
      expect(result.current.data.find(({ name }) => name === 'cherry')?.createdAt).toBe(null);
    });
  });

  it('got an error when the query is invalid', async () => {
    const { result, waitFor } = renderHook(() => useCollectionData(animalsRef(), { throwError: false }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(FirebaseError);
  });
});
