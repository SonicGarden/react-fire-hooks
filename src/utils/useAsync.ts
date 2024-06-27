import { useState, useEffect } from 'react';
import type { DependencyList } from 'react';

export const useAsync = <T>(fn: () => T | Promise<T>, deps: DependencyList = []) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;

    try {
      (async () => {
        const _data = await fn();
        mounted && setData(_data);
      })();
    } catch (error) {
      mounted && setError(error);
    } finally {
      mounted && setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, deps);

  return { loading, data, error };
};
