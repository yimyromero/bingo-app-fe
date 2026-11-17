import { createContext } from 'react'
import type { Locale } from 'date-fns'
import type { TranslationKey } from './locales/en'
import type { LangCode } from './locales'

export type TranslateParams = Record<string, string | number>

export interface I18nValue {
  lang: LangCode
  setLang: (lang: LangCode) => void
  t: (key: TranslationKey, params?: TranslateParams) => string
  // translate a message coming from the API when we know it, otherwise keep it
  tServer: (message: string) => string
  dateLocale: Locale
  // date-fns format() with the active language, default pattern "PPP"
  formatDate: (date: Date | string | number, pattern?: string) => string
  timeAgo: (date: Date | string | number) => string
}

export const I18nContext = createContext<I18nValue | null>(null)
