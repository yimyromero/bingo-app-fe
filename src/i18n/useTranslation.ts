import { useContext } from 'react'
import { I18nContext } from './i18nContext'

export const useTranslation = () => {
  const value = useContext(I18nContext)
  if (!value) {
    throw new Error('useTranslation must be used inside <I18nProvider>')
  }
  return value
}
