import { useEffect, useState, type SubmitEvent } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useAppDispatch } from '../../hooks/hooks'
import { updateBingoCell } from './bingosApiSlice'
import type { BingoDetail } from './bingosApiSlice'
import { useTranslation } from '../../i18n/useTranslation'

interface UpdateSquareModalProps {
  open: boolean
  detail: BingoDetail | null
  onClose: () => void
}

const UpdateSquareModal = ({
  open,
  detail,
  onClose,
}: UpdateSquareModalProps) => {
  const { t, formatDate } = useTranslation()
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [participantName, setParticipantName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // reset the input every time a square is opened
  useEffect(() => {
    if (open) {
      setParticipantName(detail?.participantName ?? '')
      setError(null)
    }
  }, [open, detail])

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!detail) return

    try {
      setSaving(true)
      await dispatch(
        updateBingoCell({
          id: detail.id,
          bingoId: detail.bingoId,
          participantName: participantName.trim() || null,
        })
      ).unwrap()
      onClose()
    } catch (err) {
      setError(t('grid.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      sx={
        isMobile
          ? {
              // bottom-sheet style on small screens
              '& .MuiDialog-container': { alignItems: 'flex-end' },
              '& .MuiDialog-paper': {
                m: 0,
                width: '100%',
                maxWidth: '100%',
                maxHeight: '90dvh',
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
            }
          : undefined
      }
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {t('grid.square', { number: detail?.cellNumber ?? '' })}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>
            {t('grid.squareHelp')}
          </DialogContentText>
          {detail?.takenAt && (
            <DialogContentText variant="caption" component="div">
              {t('grid.takenOn', { date: formatDate(detail.takenAt, 'PPp') })}
              {detail.updatedAt &&
                ` · ${t('grid.lastUpdated', { date: formatDate(detail.updatedAt, 'PPp') })}`}
            </DialogContentText>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label={t('grid.participantName')}
            type="text"
            fullWidth
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button variant="contained" type="submit" disabled={saving}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default UpdateSquareModal
