import { onSnapshot } from 'firebase/firestore';
import { useState } from 'react';
import { useQueriesEffect } from './useQueriesEffect';
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
    // NOTE: queryがnullの場合にワーニングが出るので、空のオブジェクトを渡している
  }, [query || ({} as Query<T>)]);

  return { data, loading };
};
