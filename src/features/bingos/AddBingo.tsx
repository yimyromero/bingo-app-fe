import { Box, Paper, Typography, TextField, Button, Stack } from '@mui/material'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/hooks'
import { addNewBingo } from './bingosApiSlice'

interface AddNewFormFields extends HTMLFormControlsCollection {
  userId: HTMLInputElement
  title: HTMLInputElement
  gridSize: HTMLInputElement
}

interface AddBingoFormElements extends HTMLFormElement {
  readonly elements: AddNewFormFields
}

const AddBingo = () => {
  const [addRequestedStatus, setAddRequestedStatus] = useState<
    'idle' | 'pending'
  >('idle')

  const dispatch = useAppDispatch()

  const handleSubmit = async (
    event: React.SubmitEvent<AddBingoFormElements>
  ) => {
    event.preventDefault()

    const { elements } = event.currentTarget

    const userId = Number(elements.userId.value)
    const title = elements.title.value
    const gridSize = Number(elements.gridSize.value)

    const form = event.currentTarget

    try {
      setAddRequestedStatus('pending')
      await dispatch(addNewBingo({ userId, title, gridSize })).unwrap()
      form.reset()
    } catch (err) {
      console.error('Failed to save the bingo:', err)
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
          New Bingo
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="User id (temp)"
              name="userId"
              type="text"
              fullWidth
              required
            />

            <TextField
              label="Title"
              name="title"
              type="text"
              fullWidth
              required
            />

            <TextField
              label="Quantity"
              name="gridSize"
              type="text"
              fullWidth
              required
            />

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

export default AddBingo
