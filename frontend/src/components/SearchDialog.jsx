import React, { useState, useEffect, useCallback, memo } from 'react';
import { Search, Code2, Layers3, GitBranch, Binary, AlertCircle, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { apiClient, getErrorMessage, endpoints } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

// Memoized search result component
const SearchResult = memo(({ result, onClick }) => {
  const isJava = result.cheatsheet === 'java';
  const isSpring = result.cheatsheet === 'springboot';
  const isGit = result.cheatsheet === 'git';

  const iconColor = isJava
    ? '#2C687B'
    : isSpring
      ? '#72BAA9'
      : isGit
        ? '#AE2448'
        : '#6E1A37';

  const tagLabel = result.cheatsheet === 'springboot' ? 'spring boot' : result.cheatsheet;

  return (
    <button
      onClick={onClick}
      className="focus-ring hover-float group w-full rounded-xl border border-border/65 bg-card/65 p-3.5 text-left transition-all duration-200 hover:border-border hover:bg-card"
    >
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${iconColor}1C` }}>
          {isJava ? (
            <Code2 className="h-4 w-4" style={{ color: iconColor }} />
          ) : isSpring ? (
            <Layers3 className="h-4 w-4" style={{ color: iconColor }} />
          ) : isGit ? (
            <GitBranch className="h-4 w-4" style={{ color: iconColor }} />
          ) : (
            <Binary className="h-4 w-4" style={{ color: iconColor }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="font-heading text-sm font-semibold text-foreground group-hover:text-[#AE2448] transition-colors">
              {result.concept_name}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
              style={{ background: `${iconColor}20`, color: iconColor }}
            >
              {tagLabel}
            </span>
          </div>

          <p className="mb-1 text-xs text-foreground/58">
            {result.section_title}
          </p>

          <p className="line-clamp-2 text-xs text-foreground/72 md:text-sm">
            {result.explanation}
          </p>
        </div>

        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-foreground/45 transition-colors group-hover:text-foreground/75" />
      </div>
    </button>
  );
});

SearchResult.displayName = 'SearchResult';

const SearchDialog = memo(({ open, onOpenChange, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isHinglish } = useLanguage();

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setError(null);
    }
  }, [open]);

  const searchCheatsheets = useCallback(async (searchQuery) => {
    try {
      setLoading(true);
      setError(null);
      const params = { q: searchQuery };
      if (isHinglish) params.lang = 'hi';
      const response = await apiClient.get(endpoints.search, { params });
      setResults(response.data);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isHinglish]);

  // Debounced search with cleanup
  useEffect(() => {
    const searchDebounced = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchCheatsheets(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchDebounced);
  }, [query, searchCheatsheets]);

  const handleSelectResult = useCallback((result) => {
    onSelectResult(result);
    onOpenChange(false);
  }, [onSelectResult, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 max-h-[80vh] max-w-[95vw] overflow-hidden rounded-2xl border-border/70 bg-[#FFFDFB] p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/70 px-4 pb-4 pt-5 sm:px-6 sm:pt-6">
          <DialogTitle className="flex items-center gap-2.5 text-base sm:text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DB1A1A1A] text-[#DB1A1A]">
              <Search className="h-4 w-4" />
            </span>
            {isHinglish ? 'Cheatsheets mein dhoondho' : 'Search Cheatsheets'}
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <Input
            data-testid="search-input"
            type="text"
            placeholder={isHinglish ? 'Concepts, annotations, methods dhoondho...' : 'Search for concepts, annotations, methods...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 rounded-xl border-border/70 bg-background/80 text-sm"
          />
        </div>

        <ScrollArea className="max-h-[50vh] px-4 pb-4 sm:max-h-[400px] sm:px-6 sm:pb-6">
          {loading && (
            <div className="py-6 text-center text-sm text-foreground/60 sm:py-8 sm:text-base">
              {isHinglish ? 'Dhoondh rahe hain...' : 'Searching...'}
            </div>
          )}

          {!loading && error && (
            <div className="py-6 text-center text-sm text-destructive sm:py-8 sm:text-base">
              <AlertCircle className="mx-auto mb-2 h-5 w-5" />
              {error}
            </div>
          )}

          {!loading && !error && query.length >= 2 && results.length === 0 && (
            <div className="py-6 text-center text-sm text-foreground/60 sm:py-8 sm:text-base">
              {isHinglish ? `"${query}" ke liye kuch nahi mila` : `No results found for "${query}"`}
            </div>
          )}

          {!loading && query.length > 0 && query.length < 2 && (
            <div className="py-6 text-center text-sm text-foreground/60 sm:py-8 sm:text-base">
              {isHinglish ? 'Kam se kam 2 characters likho' : 'Type at least 2 characters to search'}
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2 pb-1">
              {results.map((result, idx) => (
                <SearchResult
                  key={`${result.cheatsheet}-${result.section_id}-${idx}`}
                  result={result}
                  onClick={() => handleSelectResult(result)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

SearchDialog.displayName = 'SearchDialog';

export default SearchDialog;