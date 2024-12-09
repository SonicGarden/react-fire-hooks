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
  options: UseCollectionDataOptions = { throwError: true },
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean | undefined>();
  const [error, setError] = useState<FirebaseError | undefined>();

  useQueriesEffect(() => {
    let isMounted = true;
    if (!query) return;

    setLoading(true);
    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        if (!isMounted) return;
        setData(snapshot.docs.map((doc) => doc.data(options.snapshotOptions)));
        setLoading(false);
      },
      (error) => {
        if (options.throwError) throw error;
        if (!isMounted) return;
        setError(error);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
      isMounted = false;
    };
    // NOTE: Since a warning is displayed when the query is null, an empty object is being passed.
  }, [query || ({} as Query<T>)]);

  return { data, loading, error };
};
