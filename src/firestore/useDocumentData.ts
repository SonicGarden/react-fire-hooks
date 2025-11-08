import { onSnapshot } from 'firebase/firestore';
import { useState } from 'react';
import { useRefsEffect } from './useRefsEffect.js';
import type { FirebaseError } from 'firebase/app';
import type { DocumentReference, SnapshotOptions } from 'firebase/firestore';

export type UseDocumentDataOptions = {
  snapshotOptions?: SnapshotOptions;
  throwError?: boolean;
};

export const useDocumentData = <T>(
  ref?: DocumentReference<T> | null,
  { snapshotOptions, throwError = true }: UseDocumentDataOptions = {},
) => {
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState<boolean | undefined>();
  const [error, setError] = useState<FirebaseError | undefined>();

  useRefsEffect(() => {
    let isMounted = true;
    if (!ref) {
      if (isMounted) {
        setData(undefined);
        setLoading(undefined);
        setError(undefined);
      }
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (!isMounted) return;
        setData(snapshot.data(snapshotOptions));
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
  }, [ref]);

  return { data, loading, error };
};
