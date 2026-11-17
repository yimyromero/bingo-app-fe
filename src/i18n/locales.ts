import { enUS } from 'date-fns/locale/en-US'
import { es as esDate } from 'date-fns/locale/es'
import type { Locale } from 'date-fns'
import { en } from './locales/en'
import type { Messages } from './locales/en'
import { es } from './locales/es'

export interface LocaleDefinition {
  // shown in the language menu, always in the language itself
  label: string
  messages: Messages
  // used for dates ("PPP"), relative times, etc.
  dateLocale: Locale
}

/**
 * To add a language:
 *  1. copy locales/en.ts to locales/<code>.ts and translate the values
 *  2. add one line here
 */
export const locales = {
  en: { label: 'English', messages: en, dateLocale: enUS },
  es: { label: 'Español', messages: es, dateLocale: esDate },
} satisfies Record<string, LocaleDefinition>

export type LangCode = keyof typeof locales
export const DEFAULT_LANG: LangCode = 'en'
export const LANG_CODES = Object.keys(locales) as LangCode[]
