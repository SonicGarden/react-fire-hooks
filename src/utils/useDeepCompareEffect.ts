import isDeepEqual from 'fast-deep-equal/react.js';
import { useCustomCompareEffect } from './useCustomCompareEffect.js';
import type { EffectCallback, DependencyList } from 'react';

export const useDeepCompareEffect = (effect: EffectCallback, deps: DependencyList) => {
  useCustomCompareEffect(effect, deps, isDeepEqual);
};
