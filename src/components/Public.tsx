import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from '../i18n/useTranslation'

const Public = () => {
  const { t } = useTranslation()

  return (
    <>
      <LanguageSwitcher />
      <h1>{t('public.landing')}</h1>
    </>
  )
}

export default Public
