import { getDocs } from 'firebase/firestore';
import { useRef, useState } from 'react';
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
  const isMountedRef = useRef(true);

  const fetchData = () => {
    if (!query) {
      if (isMountedRef.current) {
        setData([]);
        setLoading(undefined);
        setError(undefined);
      }
      return;
    }

    setLoading(true);
    getDocs(query)
      .then((snapshot) => {
        if (!isMountedRef.current) return;
        setData(snapshot.docs.map((doc) => doc.data(snapshotOptions)));
        setLoading(false);
        setError(undefined);
      })
      .catch((error) => {
        if (throwError) throw error;
        if (!isMountedRef.current) return;
        setData([]);
        setError(error);
        setLoading(false);
      });
  };

  const reload = () => {
    fetchData();
  };

  useQueriesEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [query]);

  return { data, loading, error, reload };
};
