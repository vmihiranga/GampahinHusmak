import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../lib/translations';
import { useLocation, useRoute } from 'wouter';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
  getPathWithLang: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const VALID_LANGUAGES: Language[] = ['en', 'si', 'ta'];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  
  // Get language from URL path
  const getLangFromPath = (path: string): Language | null => {
    const segments = path.split('/').filter(Boolean);
    const firstSegment = segments[0] as Language;
    return VALID_LANGUAGES.includes(firstSegment) ? firstSegment : null;
  };

  const initialLang = getLangFromPath(location) || (localStorage.getItem('app-language') as Language) || 'en';
  const [language, setLanguageState] = useState<Language>(initialLang);

  const setLanguage = (lang: Language) => {
    if (lang === language) return;
    
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
    document.documentElement.lang = lang;

    // Update URL to include new language prefix
    const segments = location.split('/').filter(Boolean);
    const currentPathLang = getLangFromPath(location);
    
    let newPath = '';
    if (currentPathLang) {
      // Replace existing lang prefix
      newPath = '/' + [lang, ...segments.slice(1)].join('/');
    } else {
      // Add lang prefix
      newPath = '/' + [lang, ...segments].join('/');
    }
    
    if (newPath !== location) {
      setLocation(newPath);
    }
  };

  useEffect(() => {
    const langFromPath = getLangFromPath(location);
    if (langFromPath && langFromPath !== language) {
      setLanguageState(langFromPath);
      localStorage.setItem('app-language', langFromPath);
      document.documentElement.lang = langFromPath;
    }
  }, [location, language]);

  // Helper to prefix a path with current language
  const getPathWithLang = (path: string) => {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `/${language}${cleanPath ? '/' + cleanPath : ''}`;
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getPathWithLang }}>
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
