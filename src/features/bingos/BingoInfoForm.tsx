import { useState, type SubmitEvent } from 'react'
import { format, formatDate } from 'date-fns'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import {
  Edit as EditIcon,
  Event as EventIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import { useAppDispatch } from '../../hooks/hooks'
import { updateBingo } from './bingosApiSlice'
import type { Bingo } from './bingosApiSlice'

interface BingoInfoFormProps {
  bingo: Bingo
}

const toInputDate = (value: string) => format(new Date(value), 'yyyy-MM-dd')

const BingoInfoForm = ({ bingo }: BingoInfoFormProps) => {
  const dispatch = useAppDispatch()

  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState(bingo.title)
  const [raffleDate, setRaffleDate] = useState(toInputDate(bingo.raffleDate))
  const [isDone, setIsDone] = useState(!!bingo.isDone)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setTitle(bingo.title)
    setRaffleDate(toInputDate(bingo.raffleDate))
    setIsDone(!!bingo.isDone)
    setError(null)
  }

  const handleCancel = () => {
    resetForm()
    setExpanded(false)
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setSaving(true)
      setError(null)
      await dispatch(
        updateBingo({
          id: bingo.id,
          userId: bingo.userId,
          title: title.trim(),
          gridSize: bingo.gridSize,
          raffleDate: new Date(`${raffleDate}T00:00:00`).toISOString(),
          isDone,
        })
      ).unwrap()
      setExpanded(false)
    } catch (err) {
      setError('Could not save the changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => {
        if (isExpanded) resetForm()
        setExpanded(isExpanded)
      }}
      disableGutters
      variant="outlined"
      sx={{ mb: 2 }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="bingo-info-content"
        id="bingo-info-header"
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            flexWrap: 'wrap',
            rowGap: 0.5,
            width: '100%',
            pr: 1,
          }}
        >
          <Typography sx={{ fontWeight: 600 }}>{bingo.title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EventIcon sx={{ fontSize: 16 }} />
            <Typography
              component="time"
              variant="body2"
              sx={{ color: 'text.secondary' }}
            >
              {formatDate(new Date(bingo.raffleDate), 'PPP')}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={bingo.isDone ? 'finished' : 'active'}
            color={bingo.isDone ? 'error' : 'primary'}
            variant="outlined"
          />
          <Box sx={{ flexGrow: 1 }} />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: 'primary.main',
            }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {expanded ? 'Editing information' : 'Edit information'}
            </Typography>
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails id="bingo-info-content">
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              size="small"
              label="Title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              size="small"
              label="Raffle date"
              name="raffleDate"
              type="date"
              value={raffleDate}
              onChange={(e) => setRaffleDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              required
            />
            <TextField
              size="small"
              label="Squares"
              value={bingo.gridSize}
              disabled
              helperText="The number of squares can't be changed."
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isDone}
                  onChange={(e) => setIsDone(e.target.checked)}
                />
              }
              label="Finished"
            />
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'flex-end' }}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button variant="contained" type="submit" disabled={saving}>
                Save changes
              </Button>
            </Stack>
          </Stack>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

export default BingoInfoForm
