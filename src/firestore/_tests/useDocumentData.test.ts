import { cleanup, renderHook } from '@testing-library/react-hooks';
import { setDoc, updateDoc } from 'firebase/firestore';
import { describe, beforeEach, afterEach, it, expect, beforeAll, vi } from 'vitest';
import { clearFirebase, initializeTestApp } from '../../../tests/utils/firebase/app';
import { fruitRef } from '../../../tests/utils/firebase/firestore';

describe('useDocumentData', async () => {
  const { useDocumentData } = await import('../useDocumentData');

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
    const { result } = renderHook(() => useDocumentData(fruitRef('apple')));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(undefined);
  });

  it('fetches data from the specified reference', async () => {
    const { result, waitFor } = renderHook(() => useDocumentData(fruitRef('apple')));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual({ name: 'apple' });
    });
  });

  it('returns undefined if the reference is null', () => {
    const { result } = renderHook(() => useDocumentData(null));
    expect(result.current.loading).toBe(undefined);
    expect(result.current.data).toBe(undefined);
  });

  it('refetches data when the reference changes', async () => {
    const { result, waitFor, rerender } = renderHook(({ ref }) => useDocumentData(ref), {
      initialProps: { ref: fruitRef('apple') },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual({ name: 'apple' });
    });

    rerender({ ref: fruitRef('banana') });
    await waitFor(() => expect(result.current.loading).toBe(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual({ name: 'banana' });
    });
  });

  it('refetches data when the data is updated', async () => {
    const { result, waitFor } = renderHook(() => useDocumentData(fruitRef('apple')));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => {
      expect(result.current.data).toEqual({ name: 'apple' });
    });

    await updateDoc(fruitRef('apple'), { color: 'red' });
    await waitFor(() => {
      expect(result.current.data).toEqual({ name: 'apple', color: 'red' });
    });
  });
});
