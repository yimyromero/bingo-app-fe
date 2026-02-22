import { Box, Paper, Typography, TextField, Button, Stack } from '@mui/material'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/hooks'
import { addNewUser } from './usersApiSlice'

interface AddNewFormFields extends HTMLFormControlsCollection {
  email: HTMLInputElement
  password: HTMLInputElement
  name: HTMLInputElement
}

interface AddPostFormElements extends HTMLFormElement {
  readonly elements: AddNewFormFields
}

const AddUser = () => {
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
          New User
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Email Address"
              name="email"
              type="email"
              fullWidth
              required
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              fullWidth
              required
            />

            <TextField label="Name" name="name" fullWidth required />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              Save
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}

export default AddUser
