import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'mr' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (mrText: string, enText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('agro_lang') as Language) || 'mr';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('agro_lang', newLang);
  };

  // सोपा अनुवाद मदतनीस फंक्शन (Helper function)
  const t = (mrText: string, enText: string) => {
    return lang === 'mr' ? mrText : enText;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};