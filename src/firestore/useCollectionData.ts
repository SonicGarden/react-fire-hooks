import { onSnapshot } from 'firebase/firestore';
import { useState } from 'react';
import { useQueriesEffect } from './useQueriesEffect.js';
import type { Query } from 'firebase/firestore';

export const useCollectionData = <T>(query?: Query<T> | null) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean | undefined>();

  useQueriesEffect(() => {
    if (!query) return;

    setLoading(true);
    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        setData(snapshot.docs.map((doc) => doc.data()));
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        throw error;
      },
    );

    return () => unsubscribe();
    // NOTE: Since a warning is displayed when the query is null, an empty object is being passed.
  }, [query || ({} as Query<T>)]);

  return { data, loading };
};
