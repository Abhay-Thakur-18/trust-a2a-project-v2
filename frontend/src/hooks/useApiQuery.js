import { useCallback, useEffect, useRef, useState } from "react";

export const useApiQuery = (queryFn, { immediate = true, initialData = null, deps = [] } = {}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate && initialData == null);
  const [error, setError] = useState(null);
  const queryFnRef = useRef(queryFn);
  const hasDataRef = useRef(initialData != null);

  queryFnRef.current = queryFn;

  const run = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await queryFnRef.current();
      setData(result);
      hasDataRef.current = result != null;
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setData(initialData ?? null);
    hasDataRef.current = initialData != null;
    setError(null);
    if (initialData == null && immediate) setLoading(true);
    if (initialData != null) setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, ...deps]);

  useEffect(() => {
    if (!immediate) return;
    const silent = hasDataRef.current;
    run({ silent }).catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, run, ...deps]);

  return { data, loading, error, refetch: run };
};
