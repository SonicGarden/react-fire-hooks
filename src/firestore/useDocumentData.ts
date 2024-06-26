import { onSnapshot } from 'firebase/firestore';
import { useState } from 'react';
import { useRefsEffect } from './useRefsEffect.js';
import type { DocumentReference } from 'firebase/firestore';

export const useDocumentData = <T>(ref?: DocumentReference<T> | null) => {
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState<boolean | undefined>();

  useRefsEffect(() => {
    if (!ref) {
      setData(undefined);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setData(snapshot.data());
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        throw error;
      },
    );

    return () => unsubscribe();
    // NOTE: refがnullの場合にワーニングが出るので、空のオブジェクトを渡している
  }, [ref || ({} as DocumentReference<T>)]);

  return { data, loading };
};
