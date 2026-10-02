import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { Button } from './ui/button';
import { useReaderCopy } from './readerCopy';

/**
 * Thumb-reach actions for phones/tablets: Previous | Chapters | Next.
 * `sticky bottom-0` as the LAST child of the page (not `fixed`): it hovers over the content while you
 * read, but at the end of the page it settles into normal flow, so it can never cover the site footer.
 */
const ReaderBottomBar = ({ type, prev, next, onOpenChapters }) => {
  const t = useReaderCopy();

  const step = (target, label, Icon, iconAfter) => {
    const content = (
      <>
        {!iconAfter && <Icon aria-hidden="true" />}
        <span aria-hidden="true">{label.short}</span>
        <span className="sr-only">{target ? `${label.long}: ${target.title}` : label.long}</span>
        {iconAfter && <Icon aria-hidden="true" />}
      </>
    );

    return target ? (
      <Button asChild variant="outline" className="min-w-0 px-3">
        <Link to={`/${type}/${target.id}`}>{content}</Link>
      </Button>
    ) : (
      <Button variant="outline" disabled className="min-w-0 px-3">
        {content}
      </Button>
    );
  };

  return (
    <nav
      aria-label={t.controlsLabel}
      className="no-print sticky bottom-0 z-30 border-t border-border/60 bg-background/95 pb-safe backdrop-blur-md"
    >
      <div className="px-safe">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_1.4fr_1fr] gap-2 py-2 sm:px-2">
          {step(prev, { short: t.prev, long: t.prevChapter }, ChevronLeft, false)}
          <Button variant="secondary" onClick={onOpenChapters} aria-haspopup="dialog" className="min-w-0 px-3">
            <List aria-hidden="true" />
            {t.chapters}
          </Button>
          {step(next, { short: t.next, long: t.nextChapter }, ChevronRight, true)}
        </div>
      </div>
    </nav>
  );
};

export default ReaderBottomBar;
