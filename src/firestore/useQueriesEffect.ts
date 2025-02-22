import { queryEqual } from 'firebase/firestore';
import { useCustomCompareEffect } from '../utils/index.js';
import type { CustomCompareFunction } from '../utils/index.js';
import type { Query as _Query } from 'firebase/firestore';
import type { EffectCallback } from 'react';

type Query<T> = _Query<T> | null | undefined;

const queriesEqual = <T>([prevQueries]: Query<T>[][], [queries]: Query<T>[][]) => {
  if (prevQueries.length !== queries.length) return false;

  return prevQueries.every((prev, i) => {
    const current = queries[i];
    return prev ? queryEqual(prev, current!) : prev == current;
  });
};

export const useQueriesEffect = <T>(effect: EffectCallback, queries: Query<T>[]) => {
  useCustomCompareEffect(effect, [queries], queriesEqual as CustomCompareFunction);
};
