import { onSnapshot } from 'firebase/firestore';
import { useState } from 'react';
import { useRefsEffect } from './useRefsEffect.js';
import type { DocumentReference, FirestoreError, SnapshotOptions } from 'firebase/firestore';

export type UseDocumentDataOptions = {
  snapshotOptions?: SnapshotOptions;
  throwError?: boolean;
};

export const useDocumentData = <T>(ref?: DocumentReference<T> | null, options?: UseDocumentDataOptions) => {
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
        setData(snapshot.data(options?.snapshotOptions));
        setLoading(false);
      },
      (error) => {
        setError(error);
        if (isMounted) setLoading(false);
        if (options?.throwError ?? true) throw error;
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
