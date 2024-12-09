import { limit, query } from 'firebase/firestore';
import { useCallback, useMemo, useState } from 'react';
import { useDeepCompareEffect } from '../utils/index.js';
import { useCollectionDataOnce } from './useCollectionDataOnce.js';
import type { Query, SnapshotOptions } from 'firebase/firestore';

export type UsePaginatedCollectionDataOnceOptions = {
  limit?: number;
  defaultPage?: number;
  snapshotOptions?: SnapshotOptions;
  throwError?: boolean;
};

export const usePaginatedCollectionDataOnce = <T>(
  _query: Query<T> | null,
  { limit: _limit = 20, defaultPage = 1, throwError = true, ...options }: UsePaginatedCollectionDataOnceOptions = {
    throwError: true,
  },
) => {
  const [page, setPage] = useState(defaultPage);
  const [data, setData] = useState<T[]>([]);
  const paginatedQuery = _query ? query(_query, limit(_limit * page + 1)) : null;
  const { data: _data, loading: _loading, error } = useCollectionDataOnce(paginatedQuery, { ...options, throwError });
  // NOTE: Since _data temporarily becomes empty during loadMore, set loading to true during that time.
  const loading = useMemo(
    () => (_loading === undefined ? undefined : _loading || (page > 1 && _data.length === 0)),
    [_loading, page, _data.length],
  );
  const hasMore = data.length > _limit * page;
  const dataWithoutLast = useMemo(() => (hasMore ? data.slice(0, -1) : data), [data, hasMore]);
  const loadMore = useCallback(() => setPage((prev) => prev + 1), []);

  // NOTE: Since _data temporarily becomes empty during loadMore, do not update data during that time.
  useDeepCompareEffect(() => {
    if (loading) return;
    setData(_data);
  }, [loading, _data]);

  return { data: dataWithoutLast, loading, hasMore, loadMore, error };
};
