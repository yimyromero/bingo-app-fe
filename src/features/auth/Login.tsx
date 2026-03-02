import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { GridOn } from '@mui/icons-material'
import { useState, type ChangeEvent } from 'react'
import { useAppDispatch } from '../../hooks/hooks'
import { login } from '../auth/authApiSlice'
import { useNavigate, useLocation, replace } from 'react-router'

interface LoginFormFields extends HTMLFormControlsCollection {
  email: HTMLInputElement
  password: HTMLInputElement
}

interface LoginFormElement extends HTMLFormElement {
  readonly elements: LoginFormFields
}

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const location = useLocation()

  const dispatch = useAppDispatch()
  const handleEmailInput = (e: ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value)
  const handlePasswordInput = (e: ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value)

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      //setAddRequestedStatus('pending')
      const { accessToken } = await dispatch(
        login({ email, passwordHash: password })
      ).unwrap()
      const redirectToOrigin = location.state
        ? location.state.from.pathname
        : '/dash'
      navigate({ pathname: redirectToOrigin }, { replace: true })
      //form.reset()
    } catch (err) {
      console.error('Issue logging in', err)
    }
  }

  return (
    <>
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
          Welcome back
        </Typography>
        <Typography variant="body2">
          Enter your email address and password to access your account.
        </Typography>
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
              label="Email address"
              type="text"
              name="email"
              required
              value={email}
              onChange={handleEmailInput}
            />
            <TextField
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={handlePasswordInput}
            />
            <Button type="submit" variant="contained" size="large">
              Login
            </Button>
          </Stack>
        </Box>
      </Box>
    </>
  )
}

export { Login }
