import { cleanup, renderHook } from '@testing-library/react-hooks';
import { addDoc, orderBy, query } from 'firebase/firestore';
import { describe, beforeEach, afterEach, it, expect, beforeAll } from 'vitest';
import { clearFirebase, initializeTestApp } from '../../../tests/utils/firebase/app';
import { fruitsRef, vegetablesRef } from '../../../tests/utils/firebase/firestore';

describe('usePaginatedCollectionData', async () => {
  const { usePaginatedCollectionData } = await import('../usePaginatedCollectionData');

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
    await Promise.all([clearFirebase(), cleanup()]);
  });

  it('returns an empty array while fetching data', () => {
    const { result } = renderHook(() => usePaginatedCollectionData(query(fruitsRef(), orderBy('name')), { limit: 2 }));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('fetches data from the specified query', async () => {
    const { result, waitFor } = renderHook(() =>
      usePaginatedCollectionData(query(fruitsRef(), orderBy('name')), { limit: 2 }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data.length).toBe(2);
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'apple' }));
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'banana' }));
    });
  });

  it('returns an empty array if the query is null', () => {
    const { result } = renderHook(() => usePaginatedCollectionData(null, { limit: 2 }));
    expect(result.current.loading).toBe(undefined);
    expect(result.current.data).toEqual([]);
  });

  it('refetches data when the query changes', async () => {
    const { result, waitFor, rerender } = renderHook(({ ref }) => usePaginatedCollectionData(ref, { limit: 2 }), {
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
      usePaginatedCollectionData(query(fruitsRef(), orderBy('name')), { limit: 4 }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.hasMore).toBe(false);
    });
  });

  it('sets hasMore to true when there is more data', async () => {
    const { result, waitFor } = renderHook(() =>
      usePaginatedCollectionData(query(fruitsRef(), orderBy('name')), { limit: 2 }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.hasMore).toBe(true);
    });
  });

  it('loads more data when loadMore is called', async () => {
    const { result, waitFor } = renderHook(() =>
      usePaginatedCollectionData(query(fruitsRef(), orderBy('name')), { limit: 2 }),
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
});
