import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import SearchDialog from './SearchDialog';
import { Button } from './ui/button';
import { assetUrl, cn } from '../lib/utils';

const SCROLL_THRESHOLD = 110;

const isMac = () =>
  typeof navigator !== 'undefined' &&
  /mac|iphone|ipad/i.test(navigator.userAgentData?.platform || navigator.platform || '');

const isTypingTarget = (el) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName));

/** Hides the header while scrolling down on small screens. Returns [hidden, ref for the header]. */
function useAutoHide(enabled) {
  const headerRef = useRef(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!enabled || !header) {
      setHidden(false);
      return undefined;
    }

    const mobile = window.matchMedia('(max-width: 767.98px)');
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const keepVisible =
        !mobile.matches ||
        header.contains(document.activeElement) ||
        document.querySelector('[role="dialog"][data-state="open"]');
      setHidden(!keepVisible && y > lastY && y > SCROLL_THRESHOLD);
      lastY = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const reveal = () => setHidden(false);

    window.addEventListener('scroll', onScroll, { passive: true });
    mobile.addEventListener('change', reveal);
    header.addEventListener('focusin', reveal);
    return () => {
      window.removeEventListener('scroll', onScroll);
      mobile.removeEventListener('change', reveal);
      header.removeEventListener('focusin', reveal);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return [hidden, headerRef];
}

const Header = ({ title, subtitle, autoHideOnScroll = false, children }) => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const returnFocusRef = useRef(null);
  const [scrolledAway, headerRef] = useAutoHide(autoHideOnScroll);
  const hidden = scrolledAway && !searchOpen;
  const mac = isMac();

  const handleOpenChange = useCallback((open) => {
    if (open) returnFocusRef.current = document.activeElement;
    setSearchOpen(open);
  }, []);

  // The dialog has no Radix Trigger, so hand focus back to whatever opened it once it has closed.
  useEffect(() => {
    if (!searchOpen) returnFocusRef.current?.focus?.();
  }, [searchOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() !== 'k' || !(event.ctrlKey || event.metaKey) || event.altKey) return;
      if (!searchOpen && isTypingTarget(event.target)) return;
      event.preventDefault();
      handleOpenChange(!searchOpen);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [searchOpen, handleOpenChange]);

  const handleSelectResult = useCallback(
    (result) => navigate(`/${result.cheatsheet}/${result.section_id}`),
    [navigate],
  );

  return (
    <header
      ref={headerRef}
      // Lets sibling UI that sticks under the header (the reader's chapter bar) follow it up when it slides away.
      data-hidden={hidden ? 'true' : undefined}
      className={cn(
        'sticky top-0 z-40 h-[calc(var(--header-h)+env(safe-area-inset-top))] border-b border-border/60 bg-background/90 pt-safe backdrop-blur-md transition-transform duration-200 motion-reduce:transition-none',
        hidden && 'max-md:-translate-y-full',
      )}
    >
      <div className="px-safe h-full">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-2 sm:gap-4 sm:px-2 lg:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              className="focus-ring -ml-1.5 flex min-h-tap shrink-0 items-center gap-2.5 rounded-xl px-1.5 transition-colors hover:bg-muted/75"
            >
              <span className="brand-logo-shell flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                <img src={assetUrl('favicon.svg')} alt="" className="h-8 w-8 rounded-lg" />
              </span>
              <span className="flex flex-col">
                <span className="font-heading text-sm font-semibold leading-tight text-foreground">Cheatsheets</span>
                <span className="hidden text-xs leading-tight text-muted-foreground sm:block" aria-hidden="true">
                  Story-driven developer flow
                </span>
              </span>
            </Link>

            {title && (
              <div className="hidden min-w-0 border-l border-border/70 pl-3 md:block">
                {subtitle && <p className="eyebrow truncate">{subtitle}</p>}
                <p className="truncate font-heading text-base font-semibold text-foreground">{title}</p>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {children}
            <Button
              data-testid="search-btn"
              variant="outline"
              size="icon"
              aria-label="Search cheatsheets"
              aria-keyshortcuts={mac ? 'Meta+K' : 'Control+K'}
              onClick={() => handleOpenChange(true)}
              className="md:w-auto md:gap-3 md:px-3.5"
            >
              <Search aria-hidden="true" />
              <span className="max-md:sr-only">Search</span>
              <kbd
                aria-hidden="true"
                className="rounded-md border border-border/80 bg-muted/70 px-1.5 py-0.5 font-body text-xs font-semibold text-muted-foreground max-md:hidden coarse:hidden"
              >
                {mac ? '⌘K' : 'Ctrl K'}
              </kbd>
            </Button>
            <LanguageToggle />
          </div>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={handleOpenChange} onSelectResult={handleSelectResult} />
    </header>
  );
};

export default Header;
