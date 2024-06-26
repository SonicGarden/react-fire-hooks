import { refEqual } from 'firebase/firestore';
import { useCustomCompareEffect } from 'react-use';
import type { DocumentReference } from 'firebase/firestore';
import type { EffectCallback } from 'react';

const refsEqual = <T>(prevRefs: DocumentReference<T>[], refs: DocumentReference<T>[]) => {
  if (prevRefs.length !== refs.length) return false;

  return prevRefs.every((prev, i) => refEqual(prev, refs[i] as DocumentReference<T>));
};

export const useRefsEffect = <T>(effect: EffectCallback, refs: DocumentReference<T>[]) => {
  useCustomCompareEffect(effect, refs, refsEqual);
};
