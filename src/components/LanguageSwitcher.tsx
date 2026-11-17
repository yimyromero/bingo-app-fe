import { useState } from 'react'
import { Button, Menu, MenuItem } from '@mui/material'
import { Translate as TranslateIcon } from '@mui/icons-material'
import { useTranslation } from '../i18n/useTranslation'
import { LANG_CODES, locales } from '../i18n/locales'

// Languages are listed by their own name: flags stand for countries, not languages.
const LanguageSwitcher = () => {
  const { lang, setLang, t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <>
      <Button
        color="inherit"
        size="small"
        startIcon={<TranslateIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label={t('common.language')}
        aria-haspopup="menu"
        sx={{ textTransform: 'none' }}
      >
        {locales[lang].label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        {LANG_CODES.map((code) => (
          <MenuItem
            key={code}
            selected={code === lang}
            lang={code}
            onClick={() => {
              setLang(code)
              setAnchorEl(null)
            }}
          >
            {locales[code].label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default LanguageSwitcher
