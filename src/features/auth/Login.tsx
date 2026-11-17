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
import { useState, type ChangeEvent } from 'react'
import { useAppDispatch } from '../../hooks/hooks'
import { login } from '../auth/authApiSlice'
import { useNavigate, useLocation, replace } from 'react-router'
import { useTranslation } from '../../i18n/useTranslation'
import LanguageSwitcher from '../../components/LanguageSwitcher'

interface LoginFormFields extends HTMLFormControlsCollection {
  email: HTMLInputElement
  password: HTMLInputElement
}

interface LoginFormElement extends HTMLFormElement {
  readonly elements: LoginFormFields
}

const Login = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const navigate = useNavigate()
  const location = useLocation()

  const dispatch = useAppDispatch()
  const handleEmailInput = (e: ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value)
  const handlePasswordInput = (e: ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value)

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginError(null)

    try {
      //setAddRequestedStatus('pending')
      const { accessToken } = await dispatch(
        login({ email, passwordHash: password, rememberMe })
      ).unwrap()
      const redirectToOrigin = location.state
        ? location.state.from.pathname
        : '/dash'
      navigate({ pathname: redirectToOrigin }, { replace: true })
      //form.reset()
    } catch (err) {
      console.error('Issue logging in', err)
      // thunk errors are plain objects, so read name/message rather than instanceof
      const { name, message } = err as { name?: string; message?: string }
      if (name === 'TypeError') {
        // fetch itself failed: the server was never reached
        setLoginError(t('auth.networkError'))
      } else if (message === 'HTTP 400') {
        setLoginError(t('auth.missingFields'))
      } else if (message === 'HTTP 401') {
        setLoginError(t('auth.loginFailed'))
      } else {
        setLoginError(t('auth.serverError'))
      }
    }
  }

  return (
    <>
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <LanguageSwitcher />
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          mt: 14,
          mb: 4,
        }}
      >
        <GridOn
          sx={{
            fontSize: '45px',
            mb: 2,
            color: 'primary.main',
            rotate: '45deg',
          }}
        />
        <Typography
          variant="h3"
          sx={{ fontSize: 'large', fontWeight: 'bold', mb: 1 }}
        >
          {t('auth.welcomeBack')}
        </Typography>
        <Typography variant="body2">{t('auth.loginSubtitle')}</Typography>
      </Box>
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: { xs: 400 } }}
        >
          <Stack direction="column" gap={2}>
            <TextField
              label={t('auth.email')}
              type="text"
              name="email"
              required
              value={email}
              onChange={handleEmailInput}
            />
            <TextField
              label={t('auth.password')}
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={handlePasswordInput}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label={t('auth.keepSignedIn')}
            />
            {loginError && <Alert severity="error">{loginError}</Alert>}
            <Button type="submit" variant="contained" size="large">
              {t('auth.login')}
            </Button>
          </Stack>
        </Box>
      </Box>
    </>
  )
}

export { Login }
