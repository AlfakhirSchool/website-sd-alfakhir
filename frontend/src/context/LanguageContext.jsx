"use client";
import React, { createContext, useState, useContext } from 'react';
import { translations } from '../i18n/translations';

// Create Context
const LanguageContext = createContext();

// Create Provider
export const LanguageProvider = ({ children }) => {
  const [langCode, setLangCode] = useState('GB');

  const changeLanguage = (code) => {
    setLangCode(code);
    
    if (typeof window !== "undefined") {
      document.body.style.fontFamily = "'Poppins', sans-serif";
    }
  };

  const t = (section, key) => {
    const keys = key.split('.');
    let value = translations[langCode]?.[section];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || `${section}.${key}`;
  };

  return (
    <LanguageContext.Provider value={{ langCode, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the Language Context
// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  return useContext(LanguageContext);
};
