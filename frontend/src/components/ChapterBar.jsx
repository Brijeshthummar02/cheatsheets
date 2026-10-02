import React from 'react';
import { ChevronDown } from 'lucide-react';
import { getTopic } from '../lib/topics';
import { useReaderCopy } from './readerCopy';

/** Sticky strip under the header on phones/tablets: where am I, and a way to jump to another chapter. */
const ChapterBar = ({ type, index, total, title, onOpen }) => {
  const t = useReaderCopy();
  const topic = getTopic(type);

  return (
    <div className="chapter-bar no-print sticky z-30 border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="px-safe">
        <div className="mx-auto max-w-7xl sm:px-2">
          <button
            type="button"
            onClick={onOpen}
            aria-haspopup="dialog"
            className="focus-ring -mx-2 flex min-h-13 items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-muted/60"
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: topic.color }} aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold leading-4 text-muted-foreground">{t.chapterOf(index + 1, total)}</span>
              <span className="block truncate text-sm font-semibold leading-5 text-foreground">{title}</span>
            </span>
            <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">{t.browseChapters}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterBar;
