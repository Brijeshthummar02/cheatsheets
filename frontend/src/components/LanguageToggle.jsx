import React from 'react';
import { Languages } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../context/LanguageContext';

const LanguageToggle = () => {
  const { isHinglish, toggleLanguage } = useLanguage();

  return (
    <Button
      data-testid="language-toggle-btn"
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      aria-pressed={isHinglish}
      aria-label={isHinglish ? 'Language: Hinglish. Switch to English' : 'Language: English. Switch to Hinglish'}
      className="min-h-tap min-w-tap gap-1.5 px-3 text-xs uppercase tracking-[0.08em] text-foreground/80"
    >
      <Languages aria-hidden="true" />
      <span aria-hidden="true">{isHinglish ? 'HI' : 'EN'}</span>
    </Button>
  );
};

export default LanguageToggle;
