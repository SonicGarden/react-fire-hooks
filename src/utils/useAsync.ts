import { useState, useEffect } from 'react';
import type { DependencyList } from 'react';

export const useAsync = <T>(fn: () => T | Promise<T>, deps: DependencyList = []) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let isMounted = true;

    try {
      (async () => {
        const _data = await fn();
        isMounted && setData(_data);
      })();
    } catch (error) {
      isMounted && setError(error);
    } finally {
      isMounted && setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, deps);

  return { loading, data, error };
};
