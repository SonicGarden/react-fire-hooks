import { onSnapshot } from 'firebase/firestore';
import { useState } from 'react';
import { useQueriesEffect } from './useQueriesEffect.js';
import type { FirebaseError } from 'firebase/app';
import type { Query, SnapshotOptions } from 'firebase/firestore';

export type UseCollectionDataOptions = {
  snapshotOptions?: SnapshotOptions;
  throwError?: boolean;
};

export const useCollectionData = <T>(
  query?: Query<T> | null,
  { snapshotOptions, throwError = true }: UseCollectionDataOptions = {},
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean | undefined>();
  const [error, setError] = useState<FirebaseError | undefined>();

  useQueriesEffect(() => {
    let isMounted = true;
    if (!query) {
      if (isMounted) {
        setData([]);
        setLoading(undefined);
        setError(undefined);
      }
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        if (!isMounted) return;
        setData(snapshot.docs.map((doc) => doc.data(snapshotOptions)));
        setLoading(false);
      },
      (error) => {
        if (throwError) throw error;
        if (!isMounted) return;
        setError(error);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
      isMounted = false;
    };
  }, [query]);

  return { data, loading, error };
};
