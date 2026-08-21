
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface ChartSettings {
  comparisonSymbols: string[];
  startDate: string;
  endDate: string;
}

interface PreferencesContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  chartSettings: ChartSettings;
  updateChartSettings: (settings: Partial<ChartSettings>) => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persist Language
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem('userLanguage') as Language) || Language.EN
  );

  // Persist Currency
  const [currency, setCurrencyState] = useState<string>(
    () => localStorage.getItem('userCurrency') || '₹'
  );

  // Persist Chart Settings
  const [chartSettings, setChartSettingsState] = useState<ChartSettings>(() => {
    const saved = localStorage.getItem('userChartSettings');
    const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const defaultEnd = new Date().toISOString().split('T')[0];
    
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      comparisonSymbols: [],
      startDate: defaultStart,
      endDate: defaultEnd,
    };
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('userLanguage', lang);
  };

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    localStorage.setItem('userCurrency', curr);
  };

  const updateChartSettings = (newSettings: Partial<ChartSettings>) => {
    setChartSettingsState(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('userChartSettings', JSON.stringify(updated));
      return updated;
    });
  };

  const t = useCallback((key: string, replacements: { [key: string]: string } = {}): string => {
    if (key === 'raw_text') {
        return replacements.text || '';
    }

    let translation = translations[language]?.[key] || translations[Language.EN]?.[key] || key;
    
    Object.keys(replacements).forEach(rKey => {
        translation = translation.replace(`{{${rKey}}}`, replacements[rKey]);
    });
    return translation;
  }, [language]);

  return (
    <PreferencesContext.Provider value={{ 
      language, setLanguage, 
      currency, setCurrency, 
      chartSettings, updateChartSettings,
      t 
    }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

// Re-export for backward compatibility if needed, though we should update callers
export const useLanguage = usePreferences;
