import { Box, Paper, Typography, TextField, Button, Stack } from '@mui/material'
import { useState } from 'react'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import { useAppDispatch, useAppSelector } from '../../hooks/hooks'
import { selectCurrentToken } from '../auth/authApiSlice'
import { addNewBingo } from './bingosApiSlice'

interface AddNewFormFields extends HTMLFormControlsCollection {
  userId: HTMLInputElement
  title: HTMLInputElement
  quantity: HTMLInputElement
}

interface AddBingoFormElements extends HTMLFormElement {
  readonly elements: AddNewFormFields
}

interface UserInfoPayLoad extends JwtPayload {
  userInfo: {
    id: string
    role: string
  }
}

const AddBingo = () => {
  const [addRequestedStatus, setAddRequestedStatus] = useState<
    'idle' | 'pending'
  >('idle')

  const dispatch = useAppDispatch()
  const token = useAppSelector(selectCurrentToken)
  const handleSubmit = async (
    event: React.SubmitEvent<AddBingoFormElements>
  ) => {
    event.preventDefault()

    if (token) {
      const decoded = jwtDecode<UserInfoPayLoad>(token)
      const { id, role } = decoded.userInfo

      const { elements } = event.currentTarget

      const userId = Number(id)
      const title = elements.title.value
      const gridSize = Number(elements.quantity.value)

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
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mt: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: '100%',
        }}
      >
        <Typography variant="h5" mb={3}>
          New Bingo
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Stack spacing={2} direction="row">
            <TextField
              size="small"
              label="Title"
              name="title"
              type="text"
              fullWidth
              required
            />

            <TextField
              size="small"
              label="Quantity"
              name="quantity"
              type="text"
              required
            />
          </Stack>
          <Stack spacing={2}>
            <TextField
              size="small"
              label="Price"
              name="price"
              type="currency"
              fullWidth
              required
            />
          </Stack>
          <Box>
            <Typography sx={{ fontSize: 'large', fontWeight: 'medium' }}>
              Prizes
            </Typography>
            <Stack>
              <TextField size="small" label="Prize" name="prize" type="text" />
            </Stack>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            Save
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default AddBingo
