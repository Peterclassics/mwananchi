import { useEffect, useState, useCallback } from 'react';
import { api, message } from '../services/api';
export function useApi(url) {
  const [loadedUrl, setLoadedUrl] = useState(null);
  const [data, setData] = useState(null),
    [pagination, setPagination] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((v) => v + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api
      .get(url, { signal: controller.signal })
      .then((r) => {
        if (controller.signal.aborted) return;
        setData(r.data.data);
        setPagination(r.data.pagination);
        setLoadedUrl(url);
      })
      .catch((e) => {
        if (e.code !== 'ERR_CANCELED' && !controller.signal.aborted) {
          setData(null);
          setPagination(null);
          setError(message(e));
          setLoadedUrl(url);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [url, revision]);
  const current = loadedUrl === url;
  return {
    data: current ? data : null,
    pagination: current ? pagination : null,
    loading: loading || !current,
    error: current ? error : '',
    reload,
  };
}
