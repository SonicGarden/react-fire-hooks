import { renderHook } from '@testing-library/react-hooks';
import { addDoc } from 'firebase/firestore';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { clearFirebase, initializeTestApp } from '../../../tests/utils/firebase/app';
import { fruitsRef, vegetablesRef } from '../../../tests/utils/firebase/firestore';

describe('useCollectionData', async () => {
  const { useCollectionData } = await import('../useCollectionData');

  beforeEach(async () => {
    initializeTestApp();
    await Promise.all([
      addDoc(fruitsRef(), { name: 'apple' }),
      addDoc(fruitsRef(), { name: 'banana' }),
      addDoc(vegetablesRef(), { name: 'carrot' }),
      addDoc(vegetablesRef(), { name: 'potato' }),
    ]);
  });

  afterEach(async () => {
    await clearFirebase();
  });

  it('データ取得中は空配列が返ってくる', () => {
    const { result } = renderHook(() => useCollectionData(fruitsRef()));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('指定されたクエリのデータを取得する', async () => {
    const { result, waitFor } = renderHook(() => useCollectionData(fruitsRef()));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data.length).toBe(2);
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'apple' }));
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'banana' }));
    });
  });

  it('クエリがnullの場合は空配列が返ってくる', () => {
    const { result } = renderHook(() => useCollectionData(null));
    expect(result.current.loading).toBe(undefined);
    expect(result.current.data).toEqual([]);
  });

  it('クエリが変わったらデータを再取得する', async () => {
    const { result, waitFor, rerender } = renderHook(({ ref }) => useCollectionData(ref), {
      initialProps: { ref: fruitsRef() },
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data.length).toBe(2);
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'apple' }));
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'banana' }));
    });

    rerender({ ref: vegetablesRef() });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data.length).toBe(2);
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'carrot' }));
      expect(result.current.data).toContainEqual(expect.objectContaining({ name: 'potato' }));
    });
  });
});
