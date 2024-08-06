import { getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useRefsEffect } from './useRefsEffect.js';
import type { DocumentReference, SnapshotOptions } from 'firebase/firestore';

export type UseDocumentsDataOnceOptions = {
  snapshotOptions?: SnapshotOptions;
};

export const useDocumentsDataOnce = <T>(
  refs?: DocumentReference<T>[] | null,
  options?: UseDocumentsDataOnceOptions,
) => {
  const [data, setData] = useState<(T | undefined)[]>([]);
  const [loading, setLoading] = useState<boolean | undefined>();

  useRefsEffect(() => {
    let isMounted = true;
    if (!refs || refs.length === 0) {
      setData([]);
      return;
    }

    setLoading(true);
    Promise.all(refs.map((ref) => getDoc(ref)))
      .then((snapshots) => {
        if (!isMounted) return;
        setData(snapshots.map((snapshot) => snapshot.data(options?.snapshotOptions)));
        setLoading(false);
      })
      .catch((error) => {
        if (isMounted) setLoading(false);
        throw error;
      });

    return () => {
      isMounted = false;
    };
  }, refs || []);

  return { data, loading };
};
