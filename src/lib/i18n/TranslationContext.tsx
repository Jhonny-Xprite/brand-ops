import React, { createContext, useContext, ReactNode } from 'react';
import common from '../../../public/locales/pt-BR/common.json';

interface TranslationContextType {
  t: (key: string, options?: { time?: string }) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const t = (key: string, options?: { time?: string }): string => {
    const keys = key.split('.');
    let result: any = common;

    for (const k of keys) {
      result = result?.[k as keyof typeof result];
    }

    if (typeof result === 'string') {
      if (options?.time) {
        return result.replace('{{time}}', options.time);
      }
      return result;
    }

    return key; // Fallback para a chave se não encontrar
  };

  return (
    <TranslationContext.Provider value={{ t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    // Fallback silencioso para facilitar testes e desenvolvimento
    return { t: (key: string) => key };
  }
  return context;
};
