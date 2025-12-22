import { getDoc } from 'firebase/firestore';
import { useCallback, useRef, useState } from 'react';
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
  const isMountedRef = useRef(true);

  const fetchData = useCallback(() => {
    if (!ref) {
      if (isMountedRef.current) {
        setData(undefined);
        setLoading(undefined);
        setError(undefined);
      }
      return;
    }

    setLoading(true);
    getDoc(ref)
      .then((snapshot) => {
        if (!isMountedRef.current) return;
        setData(snapshot.data(snapshotOptions));
        setLoading(false);
        setError(undefined);
      })
      .catch((error) => {
        if (throwError) throw error;
        if (!isMountedRef.current) return;
        setData(undefined);
        setError(error);
        setLoading(false);
      });
  }, [ref, snapshotOptions, throwError]);

  const reload = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useRefsEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [ref]);

  return { data, loading, error, reload };
};
