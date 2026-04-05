import React, { createContext, useContext, ReactNode } from 'react'
import common from '../../../public/locales/pt-BR/common.json'

interface TranslationOptions {
  [key: string]: string | number | undefined
}

const translateCommon = (key: string, options?: TranslationOptions): string => {
  const segments = key.split('.')
  let result: unknown = common

  for (const segment of segments) {
    if (typeof result !== 'object' || result === null) {
      return key
    }

    result = (result as Record<string, unknown>)[segment]
  }

  if (typeof result === 'string') {
    if (options) {
      return Object.entries(options).reduce((translated, [token, value]) => {
        if (value === undefined) {
          return translated
        }

        return translated.split(`{{${token}}}`).join(String(value))
      }, result)
    }

    return result
  }

  return key
}

interface TranslationContextType {
  t: typeof translateCommon
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <TranslationContext.Provider value={{ t: translateCommon }}>
      {children}
    </TranslationContext.Provider>
  )
}

export const useTranslation = () => {
  const context = useContext(TranslationContext)

  if (!context) {
    return { t: translateCommon }
  }

  return context
}
