import { cleanup, renderHook } from '@testing-library/react-hooks';
import { FirebaseError } from 'firebase/app';
import { addDoc, orderBy, query } from 'firebase/firestore';
import { describe, beforeEach, afterEach, it, expect, beforeAll, vi } from 'vitest';
import { clearFirebase, initializeTestApp } from '../../../tests/utils/firebase/app';
import { animalsRef, fruitsRef, vegetablesRef } from '../../../tests/utils/firebase/firestore';

describe('usePaginatedCollectionDataOnce', async () => {
  const { usePaginatedCollectionDataOnce } = await import('../usePaginatedCollectionDataOnce');

  beforeAll(() => {
    initializeTestApp();
  });

  beforeEach(async () => {
    await Promise.all([
      addDoc(fruitsRef(), { name: 'apple' }),
      addDoc(fruitsRef(), { name: 'banana' }),
      addDoc(fruitsRef(), { name: 'cherry' }),
      addDoc(fruitsRef(), { name: 'date' }),
      addDoc(vegetablesRef(), { name: 'carrot' }),
      addDoc(vegetablesRef(), { name: 'potato' }),
    ]);
  });

  afterEach(async () => {
    await Promise.all([clearFirebase(), cleanup(), vi.restoreAllMocks()]);
  });

  it('returns an empty array while fetching data', () => {
    const { result } = renderHook(() =>
      usePaginatedCollectionDataOnce(query(fruitsRef(), orderBy('name')), { limit: 2 }),
    );
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('fetches data from the specified query', async () => {
    const { result, waitFor } = renderHook(() =>
      usePaginatedCollectionDataOnce(query(fruitsRef(), orderBy('name')), { limit: 2 }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data.length).toBe(2);
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'apple' }));
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'banana' }));
    });
  });

  it('returns an empty array if the query is null', () => {
    const { result } = renderHook(() => usePaginatedCollectionDataOnce(null, { limit: 2 }));
    expect(result.current.loading).toBe(undefined);
    expect(result.current.data).toEqual([]);
  });

  it('refetches data when the query changes', async () => {
    const { result, waitFor, rerender } = renderHook(({ ref }) => usePaginatedCollectionDataOnce(ref, { limit: 2 }), {
      initialProps: { ref: query(fruitsRef(), orderBy('name')) },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data.length).toBe(2);
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'apple' }));
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'banana' }));
    });

    rerender({ ref: query(vegetablesRef(), orderBy('name')) });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data.length).toBe(2);
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'carrot' }));
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'potato' }));
    });
  });

  it('sets hasMore to false when there is no more data', async () => {
    const { result, waitFor } = renderHook(() =>
      usePaginatedCollectionDataOnce(query(fruitsRef(), orderBy('name')), { limit: 4 }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.hasMore).toBe(false);
    });
  });

  it('sets hasMore to true when there is more data', async () => {
    const { result, waitFor } = renderHook(() =>
      usePaginatedCollectionDataOnce(query(fruitsRef(), orderBy('name')), { limit: 2 }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.hasMore).toBe(true);
    });
  });

  it('loads more data when loadMore is called', async () => {
    const { result, waitFor } = renderHook(() =>
      usePaginatedCollectionDataOnce(query(fruitsRef(), orderBy('name')), { limit: 2 }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data.length).toBe(2);
    });

    result.current.loadMore();
    await waitFor(() => expect(result.current.loading).toBe(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data.length).toBe(4);
    });
  });

  it('does not refetch data when the data is updated', async () => {
    const { result, waitFor } = renderHook(() =>
      usePaginatedCollectionDataOnce(query(fruitsRef(), orderBy('name')), { limit: 10 }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data.length).toBe(4);
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'apple' }));
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'banana' }));
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'cherry' }));
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'date' }));
    });

    await addDoc(fruitsRef(), { name: 'elderberry' });
    await waitFor(() => {
      expect(result.current.data.length).toBe(4);
    });
  });

  it('got an error when the query is invalid', async () => {
    const { result, waitFor } = renderHook(() => usePaginatedCollectionDataOnce(animalsRef(), { throwError: false }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(FirebaseError);
  });
});
