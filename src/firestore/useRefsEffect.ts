import { refEqual } from 'firebase/firestore';
import { useCustomCompareEffect } from '../utils/index.js';
import type { CustomCompareFunction } from '../utils/index.js';
import type { DocumentReference } from 'firebase/firestore';
import type { EffectCallback } from 'react';

type Ref<T> = DocumentReference<T> | null | undefined;

const refsEqual = <T>([prevRefs]: Ref<T>[][], [refs]: Ref<T>[][]) => {
  if (prevRefs.length !== refs.length) return false;

  return prevRefs.every((prev, i) => {
    const current = refs[i];
    return prev ? refEqual(prev, current!) : prev == current;
  });
};

export const useRefsEffect = <T>(effect: EffectCallback, refs: Ref<T>[]) => {
  useCustomCompareEffect(effect, [refs], refsEqual as CustomCompareFunction);
};
