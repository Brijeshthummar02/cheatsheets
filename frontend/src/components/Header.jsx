import React, { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';

const Header = memo(({ children, showJumpToJava = false, heightClass = "py-3", title, subtitle, autoHideOnScroll = false }) => {
  const navigate = useNavigate();
  const { isHinglish } = useLanguage();
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    if (!autoHideOnScroll) {
      setIsHidden(false);
      return;
    }

    let lastScrollY = window.scrollY;
    const SCROLL_THRESHOLD = 110;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;

      if (isScrollingDown && currentScrollY > SCROLL_THRESHOLD) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [autoHideOnScroll]);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md transition-transform duration-200 ${
        isHidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 ${heightClass} sm:px-6`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/')}
            className="focus-ring flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-muted/75"
            type="button"
            aria-label="Go to home"
          >
            <div className="brand-logo-shell flex h-9 w-9 items-center justify-center rounded-xl">
              <img src="/favicon.svg" alt="Cheatsheets logo" className="h-8 w-8 rounded-lg" />
            </div>
            <div className="text-left">
              <p className="font-heading text-sm font-semibold leading-none text-foreground">Cheatsheets</p>
              <p className="text-xs text-foreground/65">
                {isHinglish ? 'Story-driven developer flow' : 'Story-driven developer flow'}
              </p>
            </div>
          </button>

          {title && (
            <div>
              {subtitle && <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/54">{subtitle}</p>}
              <h1 className="font-heading text-sm font-semibold text-foreground sm:text-base">{title}</h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {children}
          {showJumpToJava && (
            <Button
              variant="outline"
              className="h-10 rounded-xl border-border/70 bg-card/70 px-4 text-xs font-semibold text-foreground/80"
              onClick={() => navigate('/java')}
            >
              {isHinglish ? 'Jump to Java' : 'Jump to Java'}
            </Button>
          )}
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;