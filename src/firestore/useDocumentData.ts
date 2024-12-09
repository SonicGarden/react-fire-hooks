import { onSnapshot } from 'firebase/firestore';
import { useState } from 'react';
import { useRefsEffect } from './useRefsEffect.js';
import type { DocumentReference, FirestoreError, SnapshotOptions } from 'firebase/firestore';

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
  const [error, setError] = useState<FirestoreError | undefined>();

  useRefsEffect(() => {
    let isMounted = true;
    if (!ref) {
      isMounted && setData(undefined);
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
    // NOTE: Since a warning is displayed when the ref is null, an empty object is being passed.
  }, [ref || ({} as DocumentReference<T>)]);

  return { data, loading, error };
};
