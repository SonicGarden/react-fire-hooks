import { getBlob, getStorage, ref } from 'firebase/storage';
import { useEffect, useMemo, useState } from 'react';

export const useStorageUrl = (path?: string | null) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      setError(null);
      return;
    }

    setLoading(true);
    getBlob(ref(getStorage(), path))
      .then((blob) => {
        setUrl(URL.createObjectURL(blob));
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [path]);

  return { loading, url, error };
};
