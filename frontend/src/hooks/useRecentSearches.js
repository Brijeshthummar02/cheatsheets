import { useCallback, useState } from 'react';

const STORAGE_KEY = 'cheatsheet-recent-searches';
const MAX_RECENT = 5;

const read = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === 'string' && item.trim()).slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
};

const write = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable (private mode / quota): recents just won't persist.
  }
};

/** Last few queries the user actually opened a result for (most recent first, de-duplicated). */
export function useRecentSearches() {
  const [recents, setRecents] = useState(read);

  const add = useCallback((query) => {
    const value = query.trim();
    if (!value) return;
    setRecents((prev) => {
      const next = [value, ...prev.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, MAX_RECENT);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    write([]);
    setRecents([]);
  }, []);

  return { recents, add, clear };
}
