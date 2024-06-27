import { onSnapshot } from 'firebase/firestore';
import { useState } from 'react';
import { useRefsEffect } from './useRefsEffect.js';
import type { DocumentReference } from 'firebase/firestore';

export const useDocumentData = <T>(ref?: DocumentReference<T> | null) => {
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState<boolean | undefined>();

  useRefsEffect(() => {
    let mounted = true;

    if (!ref) {
      mounted && setData(undefined);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        mounted && setData(snapshot.data());
        mounted && setLoading(false);
      },
      (error) => {
        mounted && setLoading(false);
        throw error;
      },
    );

    return () => {
      unsubscribe();
      mounted = false;
    };
    // NOTE: Since a warning is displayed when the ref is null, an empty object is being passed.
  }, [ref || ({} as DocumentReference<T>)]);

  return { data, loading };
};
