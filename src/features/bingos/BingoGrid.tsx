import React, { useState, type ChangeEvent, type MouseEvent } from 'react'
import { useParams } from 'react-router'
import { useAppDispatch } from '../../hooks/hooks'
import { updateBingoCell } from './bingosApiSlice'
import {
  Grid,
  styled,
  Paper,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import type { BingoDetail } from './bingosApiSlice'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}))

interface BingoGridProps {
  details: BingoDetail[]
}

const BingoGrid = ({ details }: BingoGridProps) => {
  const dispatch = useAppDispatch()
  const { id } = useParams()
  const [open, setOpen] = useState(false)
  const [cellId, setCellId] = useState<string | undefined>('')
  const [cellNumber, setCellNumber] = useState<string | undefined>('')
  const [participantName, setParticipantName] = useState<string | null>('')

  const handleInputName = (event: ChangeEvent<HTMLInputElement>) => {
    setParticipantName(event.target.value)
  }
  const handleClickOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setCellId(event.currentTarget.dataset.cellId ?? '')
    setCellNumber(event.currentTarget.dataset.cellNumber ?? '')
    setParticipantName(event.currentTarget.dataset.participantName ?? '')
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    await dispatch(
      updateBingoCell({
        id: Number(cellId),
        bingoId: Number(id),
        participantName,
      })
    ).unwrap()

    handleClose()
  }

  const colsPartition = Math.ceil(Math.sqrt(details.length))

  const grid = (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      {details.map((detail: BingoDetail) => (
        <Grid key={detail.id} size={{ xs: 3, sm: 12 / colsPartition }}>
          <Button
            sx={{
              display: 'flex',
              justifySelf: 'center',
            }}
            data-participant-name={detail.participantName}
            data-cell-id={detail.id}
            data-cell-number={detail.cellNumber}
            data-bingo-id={detail.bingoId}
            variant="contained"
            onClick={handleClickOpen}
            disabled={!!detail.participantName?.length}
          >
            {detail.cellNumber}
          </Button>
        </Grid>
      ))}
      {/* Dialog to update a square/cell */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Updating square {cellNumber}</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter the participant's name</DialogContentText>
          <form onSubmit={handleSubmit} id="subscription-form">
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              label="Name"
              type="text"
              fullWidth
              variant="outlined"
              value={participantName}
              onChange={handleInputName}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" form="subscription-form">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )

  return grid
}

export default BingoGrid
