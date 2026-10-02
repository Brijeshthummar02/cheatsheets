import { useEffect, useState } from 'react';
import { assetUrl } from '../lib/utils';

/*
 * Chapter counts per topic and language, read once from /cheatsheets/manifest.json:
 *   { java: { en: 26, hi: 20 }, springboot: { en: 16, hi: 16 }, ... }
 * Module-level cache so remounting (route changes) never refetches. On failure we cache nothing
 * and callers get `null`, so the UI shows no number rather than a wrong one.
 */
let cache = null;
let inflight = null;

function loadManifest() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch(assetUrl('cheatsheets/manifest.json'))
      .then((res) => {
        if (!res.ok) throw new Error(`manifest ${res.status}`);
        return res.json();
      })
      .then((data) => {
        cache = data && typeof data === 'object' ? data : null;
        return cache;
      })
      .catch(() => {
        inflight = null; // allow a retry on the next mount
        return null;
      });
  }
  return inflight;
}

/** Returns the manifest object, or `null` while loading / if it could not be loaded. */
export function useChapterCounts() {
  const [counts, setCounts] = useState(cache);

  useEffect(() => {
    if (cache) return undefined;
    let active = true;
    loadManifest().then((data) => {
      if (active && data) setCounts(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return counts;
}

/** Number of chapters for a topic in a language, or `null` when unknown. */
export function getChapterCount(counts, topicId, language) {
  const n = counts?.[topicId]?.[language];
  return Number.isFinite(n) ? n : null;
}

export default useChapterCounts;
