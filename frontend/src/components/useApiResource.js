import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

/*
 * GET-and-cache for the reader. Responses live in a module-level Map keyed by request URL, so:
 *  - a cached chapter / language renders synchronously (no skeleton flash, even after a remount);
 *  - a slow response for a URL the user already left can't overwrite the current one — `data` is
 *    always read back from the cache by the *current* url, and the late response's state update is
 *    skipped by the `cancelled` flag.
 * Pass `null` to stay idle.
 */
const cache = new Map();

export function useApiResource(url) {
  const [, setVersion] = useState(0);
  const [failure, setFailure] = useState(null); // { url, error }
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!url || cache.has(url)) return undefined;

    let cancelled = false;
    apiClient.get(url).then(
      (response) => {
        cache.set(url, response.data);
        if (!cancelled) setVersion((version) => version + 1);
      },
      (error) => {
        if (!cancelled) setFailure({ url, error });
      },
    );

    return () => {
      cancelled = true;
      setFailure((current) => (current?.url === url ? null : current));
    };
  }, [url, attempt]);

  const retry = useCallback(() => {
    setFailure(null);
    setAttempt((count) => count + 1);
  }, []);

  const data = url ? cache.get(url) : undefined;
  const error = failure?.url === url ? failure.error : null;

  return { data, error, loading: Boolean(url) && !data && !error, retry };
}
