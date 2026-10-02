import React, { memo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { getTopic } from '@/lib/topics';
import { cn } from '@/lib/utils';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Wrap every case-insensitive match of `query` in <mark>. Built from split(), never innerHTML. */
export function Highlight({ text, query }) {
  const needle = query.trim();
  if (!needle) return text;
  // The capture group makes split() keep the matches, which land on odd indexes.
  const parts = text.split(new RegExp(`(${escapeRegExp(needle)})`, 'gi'));
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index} className="rounded-sm bg-primary/15 font-semibold text-foreground">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

/**
 * One option in the results listbox. The whole row is the tap target; focus stays in the input
 * (aria-activedescendant), so the row itself is not focusable.
 */
const SearchResult = memo(function SearchResult({ id, result, query, active, onSelect, onActivate, index }) {
  const topic = getTopic(result.cheatsheet);
  const Icon = topic.icon;

  return (
    // Keyboard access is handled by the combobox input (aria-activedescendant + Enter), so the option
    // itself is deliberately not focusable and needs no key handler of its own.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
    <div
      id={id}
      role="option"
      aria-selected={active}
      onClick={() => onSelect(result)}
      onMouseMove={() => onActivate(index)}
      className={cn(
        'relative flex min-h-17 cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-card/70 p-3 pl-4 transition-colors',
        'before:absolute before:inset-y-2 before:left-1 before:w-1 before:rounded-full before:bg-transparent',
        'aria-selected:border-input aria-selected:bg-muted/60 aria-selected:before:bg-primary',
      )}
    >
      <span
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${topic.color}26`, color: topic.ink }}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="min-w-0 wrap-break-word font-heading text-sm font-semibold text-foreground sm:text-base">
            <Highlight text={result.concept_name} query={query} />
          </span>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: `${topic.color}26`, color: topic.ink }}
          >
            {topic.shortTitle}
          </span>
        </div>
        <p className="mt-0.5 wrap-break-word text-xs text-muted-foreground">{result.section_title}</p>
        <p className="mt-1 line-clamp-2 wrap-break-word text-sm text-foreground/75">{result.explanation}</p>
      </div>

      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </div>
  );
});

export default SearchResult;
