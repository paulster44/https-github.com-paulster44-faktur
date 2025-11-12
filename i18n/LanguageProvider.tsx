import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const availableLanguages: Record<string, string> = {
    en: './i18n/locales/en.json',
    fr: './i18n/locales/fr.json',
    es: './i18n/locales/es.json',
    it: './i18n/locales/it.json',
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    const savedLang = localStorage.getItem('faktur-lang');
    return savedLang && availableLanguages[savedLang] ? savedLang : 'en';
  });

  const [currentTranslations, setCurrentTranslations] = useState<any>({});
  const [fallbackTranslations, setFallbackTranslations] = useState<any>({});

  useEffect(() => {
    fetch(availableLanguages['en'])
      .then(res => res.json())
      .then(data => setFallbackTranslations(data))
      .catch(err => console.error("Failed to load English translations:", err));
  }, []);

  useEffect(() => {
    localStorage.setItem('faktur-lang', language);
    if (language === 'en') {
      setCurrentTranslations(fallbackTranslations);
      return;
    }
    fetch(availableLanguages[language])
      .then(res => res.json())
      .then(data => setCurrentTranslations(data))
      .catch(err => {
        console.error(`Failed to load ${language} translations, falling back to English.`, err);
        setCurrentTranslations(fallbackTranslations);
      });
  }, [language, fallbackTranslations]);

  const setLanguage = (lang: string) => {
    if (availableLanguages[lang]) {
      setLanguageState(lang);
    } else {
      console.warn(`Language '${lang}' not found. Falling back to 'en'.`);
      setLanguageState('en');
    }
  };

  const t = (key: string, options?: { [key: string]: string | number }): string => {
    const findTranslation = (source: any, translationKey: string): string | undefined => {
      if (!source || Object.keys(source).length === 0) return undefined;
      const keys = translationKey.split('.');
      let result = source;
      for (const k of keys) {
        result = result?.[k];
        if (result === undefined) return undefined;
      }
      return result;
    }

    let translation = findTranslation(currentTranslations, key) ?? findTranslation(fallbackTranslations, key);
    
    if (translation === undefined) {
      return key;
    }

    if (typeof translation === 'string' && options) {
      return Object.entries(options).reduce((acc, [optKey, value]) => {
        return acc.replace(`{{${optKey}}}`, String(value));
      }, translation);
    }

    return translation || key;
  };
  

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
