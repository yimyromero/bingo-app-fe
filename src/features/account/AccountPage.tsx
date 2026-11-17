import { useEffect, useState, type SubmitEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../hooks/hooks'
import {
  changePassword,
  fetchAccount,
  selectAccount,
  selectAccountError,
  selectAccountStatus,
  updateAccount,
} from './accountApiSlice'
import type { Account } from './accountApiSlice'
import { useTranslation } from '../../i18n/useTranslation'
import type { I18nValue } from '../../i18n/i18nContext'

// letters (any language), spaces, apostrophes, periods and hyphens
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} '.-]*$/u
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

type Translate = I18nValue['t']
type Feedback = { severity: 'success' | 'error'; message: string } | null

const validateName = (name: string, t: Translate) => {
  const value = name.trim()
  if (!value) return t('account.nameRequired')
  if (value.length > 50) return t('account.nameTooLong')
  if (!NAME_PATTERN.test(value)) return t('account.nameInvalid')
  return ''
}

const validateEmail = (email: string, t: Translate) => {
  const value = email.trim()
  if (!value) return t('account.emailRequired')
  if (!EMAIL_PATTERN.test(value)) return t('account.emailInvalid')
  return ''
}

const PersonalInformation = ({ account }: { account: Account }) => {
  const { t, tServer } = useTranslation()
  const dispatch = useAppDispatch()

  const [name, setName] = useState(account.name ?? '')
  const [email, setEmail] = useState(account.email)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const nameError = submitted ? validateName(name, t) : ''
  const emailError = submitted ? validateEmail(email, t) : ''
  const dirty =
    name.trim() !== (account.name ?? '') || email.trim() !== account.email

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setFeedback(null)

    if (validateName(name, t) || validateEmail(email, t)) return

    try {
      setSaving(true)
      const updated = await dispatch(
        updateAccount({ name: name.trim(), email: email.trim() })
      ).unwrap()
      setName(updated.name ?? '')
      setEmail(updated.email)
      setSubmitted(false)
      setFeedback({ severity: 'success', message: t('account.profileUpdated') })
    } catch (err) {
      setFeedback({
        severity: 'error',
        message:
          err instanceof Error
            ? tServer(err.message)
            : t('common.somethingWrong'),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('account.personal')}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {feedback && (
            <Alert severity={feedback.severity}>{feedback.message}</Alert>
          )}
          <TextField
            label={t('account.name')}
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!nameError}
            helperText={nameError}
            fullWidth
            required
          />
          <TextField
            label={t('account.email')}
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError || t('account.emailHelp')}
            fullWidth
            required
          />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('account.status')}
            </Typography>
            <Chip
              size="small"
              label={account.active ? t('common.active') : t('common.disabled')}
              color={account.active ? 'success' : 'default'}
              variant="outlined"
            />
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: { sm: 'flex-end' } }}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving || !dirty}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {t('account.saveChanges')}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  )
}

const PasswordAndSecurity = () => {
  const { t, tServer } = useTranslation()
  const dispatch = useAppDispatch()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const currentError =
    submitted && !currentPassword ? t('account.enterCurrent') : ''
  const newError = !submitted
    ? ''
    : newPassword.length < MIN_PASSWORD_LENGTH
      ? t('account.passwordShort', { min: MIN_PASSWORD_LENGTH })
      : newPassword === currentPassword
        ? t('account.mustDiffer')
        : ''
  const confirmError =
    submitted && confirmPassword !== newPassword ? t('account.mismatch') : ''

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setFeedback(null)

    if (
      !currentPassword ||
      newPassword.length < MIN_PASSWORD_LENGTH ||
      newPassword === currentPassword ||
      confirmPassword !== newPassword
    ) {
      return
    }

    try {
      setSaving(true)
      await dispatch(
        changePassword({ currentPassword, newPassword, confirmPassword })
      ).unwrap()
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSubmitted(false)
      setFeedback({
        severity: 'success',
        message: t('account.passwordChanged'),
      })
    } catch (err) {
      setFeedback({
        severity: 'error',
        message:
          err instanceof Error
            ? tServer(err.message)
            : t('common.somethingWrong'),
      })
    } finally {
      setSaving(false)
    }
  }

  const type = showPasswords ? 'text' : 'password'

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('account.security')}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {feedback && (
            <Alert severity={feedback.severity}>{feedback.message}</Alert>
          )}
          <TextField
            label={t('account.currentPassword')}
            name="currentPassword"
            type={type}
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={!!currentError}
            helperText={currentError}
            fullWidth
            required
          />
          <TextField
            label={t('account.newPassword')}
            name="newPassword"
            type={type}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!newError}
            helperText={
              newError ||
              t('account.passwordHelp', { min: MIN_PASSWORD_LENGTH })
            }
            fullWidth
            required
          />
          <TextField
            label={t('account.confirmPassword')}
            name="confirmPassword"
            type={type}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!confirmError}
            helperText={confirmError}
            fullWidth
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
          <Box sx={{ display: 'flex', justifyContent: { sm: 'flex-end' } }}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {t('account.changePassword')}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  )
}

const AccountPage = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const account = useAppSelector(selectAccount)
  const status = useAppSelector(selectAccountStatus)
  const error = useAppSelector(selectAccountError)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAccount())
    }
  }, [status, dispatch])

  let content: React.ReactNode

  if (status === 'failed') {
    content = <Alert severity="error">{error}</Alert>
  } else if (!account) {
    content = <Typography>{t('common.loading')}</Typography>
  } else {
    content = (
      <Stack spacing={3}>
        {/* keyed so the form resets to the saved values if the account changes */}
        <PersonalInformation key={account.id} account={account} />
        <PasswordAndSecurity />
      </Stack>
    )
  }

  return (
    <Box component="section" sx={{ maxWidth: 640, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('account.title')}
      </Typography>
      {content}
    </Box>
  )
}

export default AccountPage
