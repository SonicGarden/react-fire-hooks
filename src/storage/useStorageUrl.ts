import { getBlob, getStorage, ref } from 'firebase/storage';
import { useMemo } from 'react';
import { useAsync } from 'react-use';

export const useStorageUrl = (path?: string | null) => {
  const url = useAsync(async () => {
    if (!path) return null;

    const blob = await getBlob(ref(getStorage(), path));
    return URL.createObjectURL(blob);
  }, [path]);

  return useMemo(() => ({ loading: url.loading, url: url.value, error: url.error }), [url]);
};
