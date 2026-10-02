import { useSyncExternalStore } from 'react';

/**
 * Subscribe to a CSS media query. Example: const isDesktop = useMediaQuery('(min-width: 768px)');
 * Use it to render ONE navigation variant (desktop sidebar vs mobile sheet) instead of
 * keeping both in the DOM and hiding one with CSS.
 */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', notify);
      return () => mql.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export default useMediaQuery;
