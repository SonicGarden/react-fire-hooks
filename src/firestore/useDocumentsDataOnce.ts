import { getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useRefsEffect } from './useRefsEffect.js';
import type { FirebaseError } from 'firebase/app';
import type { DocumentReference, SnapshotOptions } from 'firebase/firestore';

export type UseDocumentsDataOnceOptions = {
  snapshotOptions?: SnapshotOptions;
  throwError?: boolean;
};

export const useDocumentsDataOnce = <T>(
  refs?: DocumentReference<T>[] | null,
  options?: UseDocumentsDataOnceOptions,
) => {
  const [data, setData] = useState<(T | undefined)[]>([]);
  const [loading, setLoading] = useState<boolean | undefined>();
  const [errors, setErrors] = useState<FirebaseError[]>([]);

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
        setErrors([...(errors ?? []), error]);
        if (isMounted) setLoading(false);
        if (options?.throwError ?? true) throw error;
      });

    return () => {
      isMounted = false;
    };
  }, refs || []);

  return { data, loading, errors };
};
