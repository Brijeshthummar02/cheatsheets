import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext(undefined);

export const LANGUAGES = {
  ENGLISH: 'en',
  HINGLISH: 'hi',
};

const STORAGE_KEY = 'cheatsheet-language';

const readStoredLanguage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === LANGUAGES.HINGLISH ? LANGUAGES.HINGLISH : LANGUAGES.ENGLISH;
  } catch {
    return LANGUAGES.ENGLISH;
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(readStoredLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Storage is unavailable (private mode); the choice simply won't persist.
    }
    document.documentElement.lang = language === LANGUAGES.HINGLISH ? 'hi-Latn' : 'en';
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === LANGUAGES.ENGLISH ? LANGUAGES.HINGLISH : LANGUAGES.ENGLISH));
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      isHinglish: language === LANGUAGES.HINGLISH,
    }),
    [language, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
