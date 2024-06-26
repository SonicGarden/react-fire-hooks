import { useEffect, useRef } from 'react';
import type { EffectCallback, DependencyList } from 'react';

export type CustomCompareFn = (prevDeps: DependencyList, deps: DependencyList) => boolean;

export const useCustomCompareEffect = (effect: EffectCallback, deps: DependencyList, isEqual: CustomCompareFn) => {
  const ref = useRef<DependencyList>();

  if (!ref.current || !isEqual(deps, ref.current)) {
    ref.current = deps;
  }

  useEffect(effect, ref.current);
};
