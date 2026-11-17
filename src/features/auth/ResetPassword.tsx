import { useState, type SubmitEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { GridOn } from '@mui/icons-material'
import { useAppDispatch } from '../../hooks/hooks'
import { resetPassword } from './authApiSlice'
import { useTranslation } from '../../i18n/useTranslation'
import LanguageSwitcher from '../../components/LanguageSwitcher'

const MIN_PASSWORD_LENGTH = 8

const ResetPassword = () => {
  const { t, tServer } = useTranslation()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const newError =
    submitted && newPassword.length < MIN_PASSWORD_LENGTH
      ? t('auth.reset.useAtLeast', { min: MIN_PASSWORD_LENGTH })
      : ''
  const confirmError =
    submitted && confirmPassword !== newPassword ? t('auth.reset.mismatch') : ''

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setError(null)

    if (
      newPassword.length < MIN_PASSWORD_LENGTH ||
      confirmPassword !== newPassword
    )
      return

    try {
      setSaving(true)
      await dispatch(
        resetPassword({ token, newPassword, confirmPassword })
      ).unwrap()
      setDone(true)
    } catch (err) {
      setError(
        err instanceof Error ? tServer(err.message) : t('common.somethingWrong')
      )
    } finally {
      setSaving(false)
    }
  }

  const type = showPasswords ? 'text' : 'password'

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        mt: 14,
        px: 2,
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <LanguageSwitcher />
      </Box>
      <GridOn
        sx={{ fontSize: '45px', mb: 2, color: 'primary.main', rotate: '45deg' }}
      />
      <Typography
        variant="h3"
        sx={{ fontSize: 'large', fontWeight: 'bold', mb: 3 }}
      >
        {t('auth.reset.title')}
      </Typography>

      <Box sx={{ width: '100%', maxWidth: 400 }}>
        {!token ? (
          <Alert severity="error">{t('auth.reset.invalidLink')}</Alert>
        ) : done ? (
          <Stack spacing={2}>
            <Alert severity="success">{t('auth.reset.success')}</Alert>
            <Button variant="contained" component={Link} to="/login">
              {t('auth.reset.goToLogin')}
            </Button>
          </Stack>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label={t('auth.reset.newPassword')}
                type={type}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={!!newError}
                helperText={
                  newError ||
                  t('auth.reset.atLeast', { min: MIN_PASSWORD_LENGTH })
                }
                required
              />
              <TextField
                label={t('auth.reset.confirmPassword')}
                type={type}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!confirmError}
                helperText={confirmError}
                required
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                  />
                }
                label={t('common.showPasswords')}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={saving}
              >
                {t('auth.reset.submit')}
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export { ResetPassword }
