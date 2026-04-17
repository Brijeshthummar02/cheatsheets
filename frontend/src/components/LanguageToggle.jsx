import React, { useCallback } from 'react';
import { Languages } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../context/LanguageContext';

const LanguageToggle = () => {
  const { isHinglish, toggleLanguage } = useLanguage();

  const handleToggle = useCallback(() => {
    toggleLanguage();
  }, [toggleLanguage]);

  return (
    <Button
      data-testid="language-toggle-btn"
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="focus-ring relative h-10 rounded-xl border-border/70 bg-card/80 px-3 text-xs font-semibold text-foreground/80 transition-all duration-200 hover:bg-muted/70"
      title={isHinglish ? 'Switch to English' : 'Switch to Hinglish'}
      aria-label={isHinglish ? 'Switch to English' : 'Switch to Hinglish'}
    >
      <Languages
        className="h-4 w-4 transition-transform duration-200"
        aria-hidden="true"
      />
      <span className="text-[11px] uppercase tracking-[0.08em]">{isHinglish ? 'HI' : 'EN'}</span>
      <span className="sr-only">
        {isHinglish ? 'Switch to English' : 'Switch to Hinglish'}
      </span>
    </Button>
  );
};

export default LanguageToggle;
