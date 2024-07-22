import { onSnapshot } from 'firebase/firestore';
import { useState } from 'react';
import { useRefsEffect } from './useRefsEffect.js';
import type { DocumentReference, SnapshotOptions, Unsubscribe } from 'firebase/firestore';

export type UseDocumentsDataOptions = {
  snapshotOptions?: SnapshotOptions;
};

export const useDocumentsData = <T>(refs?: DocumentReference<T>[] | null, options?: UseDocumentsDataOptions) => {
  const [data, setData] = useState<(T | undefined)[]>([]);
  const [loading, setLoading] = useState<boolean | undefined>();

  useRefsEffect(() => {
    let isMounted = true;
    if (!refs || refs.length === 0) {
      setData([]);
      return;
    }

    setLoading(true);
    const unsubscribes: Unsubscribe[] = [];
    const fetchDataPromises = refs.map((ref, index) => {
      return new Promise<void>((resolve) => {
        const unsubscribe = onSnapshot(
          ref,
          (snapshot) => {
            if (isMounted)
              setData((prevData) => {
                const newData = [...prevData];
                newData[index] = snapshot.data(options?.snapshotOptions);
                return newData;
              });
            resolve();
          },
          (error) => {
            if (isMounted) setLoading(false);
            throw error;
          },
        );
        unsubscribes.push(unsubscribe);
      });
    });

    Promise.all(fetchDataPromises).then(() => {
      setLoading(false);
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      isMounted = false;
    };
  }, refs || []);

  return { data, loading };
};
