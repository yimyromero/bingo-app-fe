import { Box, Paper, Typography, TextField, Button, Stack } from '@mui/material'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/hooks'
import { addNewUser } from './usersApiSlice'
import { useTranslation } from '../../i18n/useTranslation'

interface AddNewFormFields extends HTMLFormControlsCollection {
  email: HTMLInputElement
  password: HTMLInputElement
  name: HTMLInputElement
}

interface AddPostFormElements extends HTMLFormElement {
  readonly elements: AddNewFormFields
}

const AddUser = () => {
  const { t } = useTranslation()
  const [addRequestedStatus, setAddRequestedStatus] = useState<
    'idle' | 'pending'
  >('idle')

  const dispatch = useAppDispatch()

  const handleSubmit = async (
    event: React.SubmitEvent<AddPostFormElements>
  ) => {
    event.preventDefault()

    const { elements } = event.currentTarget

    const email = elements.email.value
    const passwordHash = elements.password.value
    const name = elements.name.value

    const form = event.currentTarget

    try {
      setAddRequestedStatus('pending')
      await dispatch(addNewUser({ email, passwordHash, name })).unwrap()
      form.reset()
    } catch (err) {
      console.error('Failed to save the user:', err)
    } finally {
      setAddRequestedStatus('idle')
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mt: 6,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 4,
          width: 400,
        }}
      >
        <Typography variant="h5" mb={3}>
          {t('users.newUserTitle')}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label={t('users.email')}
              name="email"
              type="email"
              fullWidth
              required
            />

            <TextField
              label={t('users.password')}
              name="password"
              type="password"
              autoComplete="current-password"
              fullWidth
              required
            />

            <TextField label={t('users.name')} name="name" fullWidth required />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              {t('common.save')}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}

export default AddUser
