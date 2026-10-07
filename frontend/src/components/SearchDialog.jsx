import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, History, Loader2, Search, SearchX, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import SearchResult from './SearchResult';
import { apiClient, endpoints, getErrorKind } from '../lib/api';
import { TOPIC_IDS } from '../lib/topics';
import { useDebounce } from '../hooks/useDebounce';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { useLanguage } from '../context/LanguageContext';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;
const RESULT_CAP = 20; // mirrors the cap in api.js
const SUGGESTIONS = ['stream', 'REST', 'rebase', 'binary search', 'hashmap'];

const ERROR_COPY = {
  en: {
    offline: 'You appear to be offline. Check your connection and try again.',
    'not-found': "We couldn't find that cheatsheet.",
    server: 'Something went wrong on our side. Please try again.',
    unknown: "Something didn't work as expected. Please try again.",
  },
  hi: {
    offline: 'Lagta hai tum offline ho. Connection check karo aur phir try karo.',
    'not-found': 'Wo cheatsheet nahi mili.',
    server: 'Humari taraf se kuch gadbad ho gayi. Thodi der baad phir try karo.',
    unknown: 'Kuch theek se nahi chala. Phir try karo.',
  },
};

/**
 * Keeps the dialog's height equal to what is really visible on phones, so the field and the results
 * stay above the soft keyboard (dvh alone does not shrink for it on iOS / newer Chrome).
 */
function useVisibleViewport(enabled) {
  const [box, setBox] = useState(null);
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!enabled || !vv) return undefined;
    const update = () => setBox({ top: vv.offsetTop, height: vv.height });
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [enabled]);
  return box;
}

function SearchPanel({ onOpenChange, onSelectResult }) {
  const { isHinglish } = useLanguage();
  const { recents, add: addRecent, clear: clearRecents } = useRecentSearches();
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = (index) => `${baseId}-option-${index}`;

  const inputRef = useRef(null);
  const listRef = useRef(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [resultsFor, setResultsFor] = useState('');
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const trimmed = query.trim();
  const debounced = useDebounce(trimmed, DEBOUNCE_MS);
  const searchable = debounced.length >= MIN_QUERY_LENGTH;
  // Typing has moved on but the debounce (or the request) hasn't caught up yet.
  const pending =
    trimmed.length >= MIN_QUERY_LENGTH && (trimmed !== debounced || (trimmed !== resultsFor && !error));
  const settled = searchable && !pending && trimmed === resultsFor;
  const hasResults = results.length > 0 && trimmed.length >= MIN_QUERY_LENGTH;

  const viewport = useVisibleViewport(true);

  // Pre-warm: fetch every topic while the browser is idle so the first search is instant.
  useEffect(() => {
    const params = isHinglish ? { lang: 'hi' } : {};
    const warm = () =>
      TOPIC_IDS.forEach((id) => {
        apiClient.get(endpoints.cheatsheet(id), { params }).catch(() => {});
      });
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(warm, { timeout: 1500 });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = setTimeout(warm, 200);
    return () => clearTimeout(handle);
  }, [isHinglish]);

  // Run the search. `cancelled` is flipped by the cleanup, so a slow earlier request can never
  // overwrite the results of a newer query (or land after the dialog closed).
  useEffect(() => {
    if (!searchable) return undefined;
    let cancelled = false;
    const params = { q: debounced };
    if (isHinglish) params.lang = 'hi';
    apiClient
      .get(endpoints.search, { params })
      .then((response) => {
        if (cancelled) return;
        setResults(response.data);
        setResultsFor(debounced);
        setActiveIndex(0);
        if (listRef.current) listRef.current.scrollTop = 0;
      })
      .catch((err) => {
        if (cancelled) return;
        setResults([]);
        setResultsFor('');
        setError(getErrorKind(err));
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, searchable, isHinglish, retryCount]);

  // Keep the active option in view while moving with the keyboard.
  useEffect(() => {
    if (!hasResults) return;
    document.getElementById(`${baseId}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, hasResults, baseId]);

  const handleSelect = useCallback(
    (result) => {
      addRecent(trimmed);
      onSelectResult(result);
      onOpenChange(false);
    },
    [addRecent, trimmed, onSelectResult, onOpenChange],
  );

  // Every query change goes through here. When the query becomes too short to search, drop the previous
  // results/error right away (adjusting state in the event handler, not in an effect after the render).
  const changeQuery = (value) => {
    setQuery(value);
    setError(null);
    if (value.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setResultsFor('');
    }
  };

  const runQuery = (value) => {
    changeQuery(value);
    inputRef.current?.focus();
  };

  const clearQuery = () => {
    changeQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.nativeEvent.isComposing) return;
    const count = hasResults ? results.length : 0;
    switch (event.key) {
      case 'ArrowDown':
        if (!count) return;
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % count);
        break;
      case 'ArrowUp':
        if (!count) return;
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + count) % count);
        break;
      case 'Home':
        if (!count) return;
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        if (!count) return;
        event.preventDefault();
        setActiveIndex(count - 1);
        break;
      case 'Enter':
        if (!count) return;
        event.preventDefault();
        handleSelect(results[Math.min(activeIndex, count - 1)]);
        break;
      default:
    }
  };

  const copy = isHinglish
    ? {
        title: 'Cheatsheets mein dhoondho',
        placeholder: 'Concepts, commands dhoondho...',
        clear: 'Search saaf karo',
        hint: 'Java, Spring Boot, DSA, Git aur DevOps ke concepts, annotations aur commands dhoondho.',
        recent: 'Haal ki searches',
        clearRecent: 'Saaf karo',
        suggestions: 'Ye try karo',
        searching: 'Dhoondh rahe hain...',
        minChars: 'Kam se kam 2 characters likho',
        count: (n, q) => `“${q}” ke liye ${n >= RESULT_CAP ? `top ${n}` : n} ${n === 1 ? 'result' : 'results'}`,
        none: (q) => `“${q}” ke liye kuch nahi mila`,
        noneTitle: 'Kuch nahi mila',
        noneTip: 'Chhota ya alag keyword try karo.',
        errorTitle: 'Search nahi ho paayi',
        retry: 'Phir try karo',
      }
    : {
        title: 'Search cheatsheets',
        placeholder: 'Search concepts, commands...',
        clear: 'Clear search',
        hint: 'Find concepts, annotations and commands across Java, Spring Boot, DSA, Git and DevOps.',
        recent: 'Recent searches',
        clearRecent: 'Clear',
        suggestions: 'Try searching for',
        searching: 'Searching...',
        minChars: 'Type at least 2 characters to search',
        count: (n, q) => `${n >= RESULT_CAP ? `Top ${n}` : n} ${n === 1 ? 'result' : 'results'} for “${q}”`,
        none: (q) => `No results for “${q}”`,
        noneTitle: 'No matches found',
        noneTip: 'Try a shorter or different keyword.',
        errorTitle: "Couldn't run the search",
        retry: 'Try again',
      };

  let status = '';
  if (pending) status = copy.searching;
  else if (trimmed.length === 1) status = copy.minChars;
  else if (settled && hasResults) status = copy.count(results.length, trimmed);
  else if (settled && !error) status = copy.none(trimmed);

  const showInitial = trimmed.length < MIN_QUERY_LENGTH;
  const showError = !showInitial && !pending && error;
  const showNone = settled && !hasResults && !error;
  const showSkeleton = !showInitial && pending && !hasResults;

  return (
    <DialogContent
      mobile="fullscreen"
      aria-describedby={undefined}
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        inputRef.current?.focus();
      }}
      onEscapeKeyDown={(event) => {
        // First Escape clears the field, the next one closes the dialog.
        if (query) {
          event.preventDefault();
          clearQuery();
        }
      }}
      style={viewport ? { '--search-top': `${viewport.top}px`, '--search-height': `${viewport.height}px` } : undefined}
      className="gap-0 p-0 max-sm:top-(--search-top,0px) max-sm:h-(--search-height,100dvh) sm:max-w-2xl [@media(max-height:30rem)]:sm:max-h-[calc(100dvh-1rem)]"
    >
      <DialogHeader className="px-4 pb-3 pt-4 sm:px-6 sm:pt-5">
        <DialogTitle className="flex items-center gap-2.5 text-base sm:text-lg">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
            <Search className="h-4 w-4" />
          </span>
          {copy.title}
        </DialogTitle>
      </DialogHeader>

      <div className="px-4 sm:px-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            ref={inputRef}
            data-testid="search-input"
            type="search"
            role="combobox"
            aria-label={copy.title}
            aria-autocomplete="list"
            aria-expanded={hasResults}
            aria-controls={hasResults ? listboxId : undefined}
            aria-activedescendant={hasResults ? optionId(activeIndex) : undefined}
            enterKeyHint="search"
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={copy.placeholder}
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-11 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              aria-label={copy.clear}
              className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Reserved status row: announces progress and the result count without shifting the layout. */}
      <div className="flex min-h-9 items-center gap-2 px-4 text-xs text-muted-foreground sm:px-6" role="status" aria-live="polite">
        {pending && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />}
        <span className="min-w-0 wrap-break-word">{status}</span>
      </div>

      <div
        ref={listRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-border/70 px-4 py-3 sm:min-h-[min(18rem,30dvh)] sm:flex-[0_1_auto] sm:max-h-[60dvh] sm:px-6"
        aria-busy={pending}
      >
        {showInitial && (
          <div className="space-y-5">
            <p className="text-sm text-foreground/75">{copy.hint}</p>

            {recents.length > 0 && (
              <section aria-labelledby={`${baseId}-recent`}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h3 id={`${baseId}-recent`} className="eyebrow">
                    {copy.recent}
                  </h3>
                  <button
                    type="button"
                    onClick={clearRecents}
                    className="focus-ring min-h-tap rounded-xl px-3 text-sm font-semibold text-primary transition-colors hover:bg-muted/70"
                  >
                    {copy.clearRecent}
                  </button>
                </div>
                <ul className="space-y-1">
                  {recents.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => runQuery(item)}
                        className="focus-ring flex min-h-tap w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-foreground transition-colors hover:bg-muted/70"
                      >
                        <History className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        <span className="min-w-0 wrap-break-word">{item}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby={`${baseId}-suggest`}>
              <h3 id={`${baseId}-suggest`} className="eyebrow mb-2">
                {copy.suggestions}
              </h3>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => runQuery(term)}
                    className="focus-ring min-h-tap rounded-full border border-input bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted/70"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {showSkeleton && (
          <div className="space-y-2" aria-hidden="true">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-17 animate-pulse rounded-xl border border-border/70 bg-muted/60" />
            ))}
          </div>
        )}

        {hasResults && !showError && (
          <div id={listboxId} role="listbox" aria-label={copy.title} className="space-y-2">
            {results.map((result, index) => (
              <SearchResult
                key={`${result.cheatsheet}-${result.section_id}-${index}`}
                id={optionId(index)}
                index={index}
                result={result}
                query={resultsFor}
                active={index === activeIndex}
                onSelect={handleSelect}
                onActivate={setActiveIndex}
              />
            ))}
          </div>
        )}

        {showNone && (
          <div className="flex flex-col items-center gap-2 px-2 py-10 text-center">
            <SearchX className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="font-heading text-base font-semibold text-foreground wrap-break-word">{copy.noneTitle}</p>
            <p className="text-sm text-muted-foreground">{copy.noneTip}</p>
          </div>
        )}

        {showError && (
          <div role="alert" className="flex flex-col items-center gap-3 px-2 py-10 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
            <p className="font-heading text-base font-semibold text-foreground">{copy.errorTitle}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{ERROR_COPY[isHinglish ? 'hi' : 'en'][error]}</p>
            <Button variant="outline" onClick={() => {
                setError(null);
                setRetryCount((count) => count + 1);
              }}>
              {copy.retry}
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
}

/**
 * Search dialog (Ctrl/Cmd+K). Mount it anywhere; it owns its query/results state and starts fresh
 * every time it is opened.
 * onSelectResult receives { cheatsheet, section_id, section_title, concept_name, explanation, code }.
 */
const SearchDialog = ({ open, onOpenChange, onSelectResult }) => {
  // A new `session` key per opening remounts the panel, so nothing from the last search leaks in —
  // while the old state stays on screen during the close animation.
  const [session, setSession] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSession((value) => value + 1);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SearchPanel key={session} onOpenChange={onOpenChange} onSelectResult={onSelectResult} />
    </Dialog>
  );
};

export default SearchDialog;
