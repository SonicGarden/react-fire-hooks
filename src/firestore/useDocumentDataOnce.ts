import { getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useRefsEffect } from './useRefsEffect.js';
import type { FirebaseError } from 'firebase/app';
import type { DocumentReference, SnapshotOptions } from 'firebase/firestore';

export type UseDocumentDataOnceOptions = {
  snapshotOptions?: SnapshotOptions;
  throwError?: boolean;
};

export const useDocumentDataOnce = <T>(ref?: DocumentReference<T> | null, options?: UseDocumentDataOnceOptions) => {
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState<boolean | undefined>();
  const [error, setError] = useState<FirebaseError | undefined>();

  useRefsEffect(() => {
    let isMounted = true;
    if (!ref) {
      setData(undefined);
      return;
    }

    setLoading(true);
    getDoc(ref)
      .then((snapshot) => {
        if (!isMounted) return;
        setData(snapshot.data(options?.snapshotOptions));
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        if (isMounted) setLoading(false);
        if (options?.throwError ?? true) throw error;
      });

    return () => {
      isMounted = false;
    };
    // NOTE: Since a warning is displayed when the ref is null, an empty object is being passed.
  }, [ref || ({} as DocumentReference<T>)]);

  return { data, loading, error };
};
