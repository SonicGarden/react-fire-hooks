import { getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useRefsEffect } from './useRefsEffect.js';
import type { FirebaseError } from 'firebase/app';
import type { DocumentReference, SnapshotOptions } from 'firebase/firestore';

export type UseDocumentDataOnceOptions = {
  snapshotOptions?: SnapshotOptions;
  throwError?: boolean;
};

export const useDocumentDataOnce = <T>(
  ref?: DocumentReference<T> | null,
  { snapshotOptions, throwError = true }: UseDocumentDataOnceOptions = {},
) => {
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState<boolean | undefined>();
  const [error, setError] = useState<FirebaseError | undefined>();

  useRefsEffect(() => {
    let isMounted = true;
    if (!ref) {
      isMounted && setData(undefined);
      return;
    }

    setLoading(true);
    getDoc(ref)
      .then((snapshot) => {
        if (!isMounted) return;
        setData(snapshot.data(snapshotOptions));
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
  }, [ref]);

  return { data, loading, error };
};
