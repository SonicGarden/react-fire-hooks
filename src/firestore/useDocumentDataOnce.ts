import { getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useRefsEffect } from './useRefsEffect.js';
import type { DocumentReference } from 'firebase/firestore';

export const useDocumentDataOnce = <T>(ref?: DocumentReference<T> | null) => {
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState<boolean | undefined>();

  useRefsEffect(() => {
    if (!ref) {
      setData(undefined);
      return;
    }

    setLoading(true);
    getDoc(ref)
      .then((snapshot) => {
        setData(snapshot.data());
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        throw error;
      });
    // NOTE: Since a warning is displayed when the ref is null, an empty object is being passed.
  }, [ref || ({} as DocumentReference<T>)]);

  return { data, loading };
};
