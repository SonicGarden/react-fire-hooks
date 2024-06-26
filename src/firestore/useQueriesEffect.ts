import { queryEqual } from 'firebase/firestore';
import { useCustomCompareEffect } from '../utils/index.js';
import type { CustomCompareFn } from '../utils/index.js';
import type { Query } from 'firebase/firestore';
import type { EffectCallback } from 'react';

const queriesEqual = <T>(prevQueries: Query<T>[], queries: Query<T>[]) => {
  if (prevQueries.length !== queries.length) return false;

  return prevQueries.every((prev, i) => queryEqual(prev, queries[i] as Query<T>));
};

export const useQueriesEffect = <T>(effect: EffectCallback, queries: Query<T>[]) => {
  useCustomCompareEffect(effect, queries, queriesEqual as CustomCompareFn);
};
