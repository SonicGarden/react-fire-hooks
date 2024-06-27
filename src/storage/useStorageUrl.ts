import { getBlob, getStorage, ref } from 'firebase/storage';
import { useAsync } from '../utils/index.js';

export const useStorageUrl = (path?: string | null) => {
  const { loading, data, error } = useAsync(async () => {
    if (!path) {
      return { url: null, blob: null };
    }

    const blob = await getBlob(ref(getStorage(), path));
    return { url: URL.createObjectURL(blob), blob };
  }, [path]);

  return { loading, data, error };
};
