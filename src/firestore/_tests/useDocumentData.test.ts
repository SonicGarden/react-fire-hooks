import { renderHook } from '@testing-library/react-hooks';
import { setDoc } from 'firebase/firestore';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { clearFirebase, initializeTestApp } from '../../../tests/utils/firebase/app';
import { fruitRef } from '../../../tests/utils/firebase/firestore';

describe('useDocumentData', async () => {
  const { useDocumentData } = await import('../useDocumentData');

  beforeEach(async () => {
    initializeTestApp();
    await Promise.all([setDoc(fruitRef('apple'), { name: 'apple' }), setDoc(fruitRef('banana'), { name: 'banana' })]);
  });

  afterEach(async () => {
    await clearFirebase();
  });

  it('データ取得中はundefinedが返ってくる', () => {
    const { result } = renderHook(() => useDocumentData(fruitRef('apple')));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(undefined);
  });

  it('指定されたリファレンスのデータを取得する', async () => {
    const { result, waitFor } = renderHook(() => useDocumentData(fruitRef('apple')));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual({ name: 'apple' });
    });
  });

  it('リファレンスがnullの場合はundefinedが返ってくる', () => {
    const { result } = renderHook(() => useDocumentData(null));
    expect(result.current.loading).toBe(undefined);
    expect(result.current.data).toBe(undefined);
  });

  it('リファレンスが変わったらデータを再取得する', async () => {
    const { result, waitFor, rerender } = renderHook(({ ref }) => useDocumentData(ref), {
      initialProps: { ref: fruitRef('apple') },
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual({ name: 'apple' });
    });

    rerender({ ref: fruitRef('banana') });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual({ name: 'banana' });
    });
  });
});
