import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { DEFAULT_LANG, LANG_CODES, locales } from './locales'
import type { LangCode } from './locales'
import { I18nContext } from './i18nContext'
import type { I18nValue, TranslateParams } from './i18nContext'
import type { TranslationKey } from './locales/en'

const STORAGE_KEY = 'bingo.lang'

const isLang = (value: string | null): value is LangCode =>
  !!value && (LANG_CODES as string[]).includes(value)

// saved choice first, then the browser language, then English
const detectLang = (): LangCode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch {
    // storage can be blocked, fall through
  }
  const preferred = navigator.languages?.length
    ? navigator.languages
    : [navigator.language]
  for (const tag of preferred) {
    const code = tag?.slice(0, 2).toLowerCase() ?? null
    if (isLang(code)) return code
  }
  return DEFAULT_LANG
}

const lookup = (messages: unknown, key: string): string | undefined => {
  const value = key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === 'object'
          ? (node as Record<string, unknown>)[part]
          : undefined,
      messages
    )
  return typeof value === 'string' ? value : undefined
}

// API messages we know how to translate (exact English text from the backend).
// Anything else is shown as received. Error codes from the API would replace this.
const SERVER_MESSAGES: Record<string, TranslationKey> = {
  'Current password is incorrect.': 'account.errors.currentIncorrect',
  'That email address is already in use.': 'account.errors.emailInUse',
  'This reset link is invalid or has expired.': 'auth.reset.invalidOrExpired',
  "You can't deactivate your own account.": 'users.errors.deactivateSelf',
  "You can't deactivate the last active administrator.":
    'users.errors.lastAdmin',
  'Email is not configured on the server.': 'users.errors.emailNotConfigured',
  'The reset email could not be sent.': 'users.errors.emailFailed',
}

const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<LangCode>(detectLang)
  const { messages, dateLocale } = locales[lang]

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: LangCode) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // not persisted, still applied for this visit
    }
  }, [])

  const value = useMemo<I18nValue>(() => {
    const t = (key: TranslationKey, params?: TranslateParams) => {
      // fall back to English, then to the key, so a gap never breaks the UI
      const text =
        lookup(messages, key) ??
        lookup(locales[DEFAULT_LANG].messages, key) ??
        key
      return text.replace(/\{(\w+)\}/g, (_, name: string) =>
        params && name in params ? String(params[name]) : `{${name}}`
      )
    }

    return {
      lang,
      setLang,
      t,
      tServer: (message) => {
        if (message.startsWith('Validation failed')) {
          return message.replace(
            'Validation failed',
            t('common.validationFailed')
          )
        }
        const key = SERVER_MESSAGES[message]
        return key ? t(key) : message
      },
      dateLocale,
      formatDate: (date, pattern = 'PPP') =>
        format(new Date(date), pattern, { locale: dateLocale }),
      timeAgo: (date) =>
        formatDistanceToNow(new Date(date), {
          addSuffix: true,
          locale: dateLocale,
        }),
    }
  }, [lang, setLang, messages, dateLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export { I18nProvider }
