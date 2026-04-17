import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(undefined);

export const LANGUAGES = {
  ENGLISH: 'en',
  HINGLISH: 'hi',
};

export function LanguageProvider({ children }) {
  // Initialize from localStorage or default to English
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cheatsheet-language');
      return saved || LANGUAGES.ENGLISH;
    }
    return LANGUAGES.ENGLISH;
  });

  // Persist language preference to localStorage
  useEffect(() => {
    localStorage.setItem('cheatsheet-language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => 
      prev === LANGUAGES.ENGLISH ? LANGUAGES.HINGLISH : LANGUAGES.ENGLISH
    );
  };

  const isHinglish = language === LANGUAGES.HINGLISH;

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    isHinglish,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
