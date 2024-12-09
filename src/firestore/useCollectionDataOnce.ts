import { getDocs } from 'firebase/firestore';
import { useState } from 'react';
import { useQueriesEffect } from './useQueriesEffect.js';
import type { FirebaseError } from 'firebase/app';
import type { Query, SnapshotOptions } from 'firebase/firestore';

export type UseCollectionDataOnceOptions = {
  snapshotOptions?: SnapshotOptions;
  throwError?: boolean;
};

export const useCollectionDataOnce = <T>(
  query?: Query<T> | null,
  { snapshotOptions, throwError = true }: UseCollectionDataOnceOptions = {},
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean | undefined>();
  const [error, setError] = useState<FirebaseError | undefined>();

  useQueriesEffect(() => {
    let isMounted = true;
    if (!query) return;

    setLoading(true);
    getDocs(query)
      .then((snapshot) => {
        if (!isMounted) return;
        setData(snapshot.docs.map((doc) => doc.data(snapshotOptions)));
        setLoading(false);
      })
      .catch((error) => {
        if (throwError) throw error;
        if (!isMounted) return;
        setError(error);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
    // NOTE: Since a warning is displayed when the query is null, an empty object is being passed.
  }, [query || ({} as Query<T>)]);

  return { data, loading, error };
};
