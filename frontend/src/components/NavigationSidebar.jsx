import React, { memo, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getTopic } from '../lib/topics';
import { cn } from '../lib/utils';
import { useReaderCopy } from './readerCopy';

/** Closest ancestor that scrolls vertically (the sticky sidebar or the sheet body). */
function scrollParent(element) {
  let parent = element.parentElement;
  while (parent && !/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) {
    parent = parent.parentElement;
  }
  return parent;
}

/** Brings `element` into view inside its own scroller only — never scrolls the page. */
function revealInScroller(element) {
  const scroller = scrollParent(element);
  if (!scroller) return;
  const box = scroller.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  if (rect.top < box.top || rect.bottom > box.bottom) {
    scroller.scrollTop += rect.top - box.top - (box.height - rect.height) / 2;
  }
}

const ChapterLink = memo(({ section, index, isActive, type, onNavigate }) => {
  const topic = getTopic(type);
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (isActive && ref.current) revealInScroller(ref.current);
  }, [isActive]);

  return (
    <Link
      ref={ref}
      to={`/${type}/${section.id}`}
      data-testid={`sidebar-${section.id}`}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'focus-ring flex min-h-tap items-start gap-3 rounded-xl px-3 py-2.5 text-sm leading-5 transition-colors',
        isActive ? 'font-semibold text-foreground' : 'text-foreground/85 hover:bg-muted/70 hover:text-foreground',
      )}
      style={isActive ? { background: `${topic.color}22`, boxShadow: `inset 3px 0 0 ${topic.color}` } : undefined}
    >
      <span
        className={cn('w-6 shrink-0 text-xs font-semibold tabular-nums leading-5', !isActive && 'text-muted-foreground')}
        style={isActive ? { color: topic.ink } : undefined}
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="min-w-0 wrap-break-word">{section.title}</span>
    </Link>
  );
});

ChapterLink.displayName = 'ChapterLink';

/** The chapter list. Used inside the desktop sidebar and the mobile chapter sheet. */
const NavigationSidebar = memo(({ sections, activeSection, cheatsheetType, onNavigate }) => {
  const t = useReaderCopy();

  return (
    <nav aria-label={t.chapters}>
      <ol className="space-y-1 coarse:space-y-2">
        {sections.map((section, index) => (
          <li key={section.id}>
            <ChapterLink
              section={section}
              index={index}
              isActive={activeSection === section.id}
              type={cheatsheetType}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
});

NavigationSidebar.displayName = 'NavigationSidebar';

export default NavigationSidebar;
