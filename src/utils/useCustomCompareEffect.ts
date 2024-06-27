import { useEffect, useRef } from 'react';
import type { EffectCallback, DependencyList } from 'react';

export type CustomCompareFunction = (prevDeps: DependencyList, deps: DependencyList) => boolean;

export const useCustomCompareEffect = (
  effect: EffectCallback,
  deps: DependencyList,
  isEqual: CustomCompareFunction,
) => {
  const ref = useRef<DependencyList>();

  if (!ref.current || !isEqual(deps, ref.current)) {
    ref.current = deps;
  }

  useEffect(effect, ref.current);
};
