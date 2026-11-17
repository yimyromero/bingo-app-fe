import { useEffect, useMemo, useState } from 'react'
import { formatDate } from 'date-fns'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../../hooks/hooks'
import {
  refreshBingoSnapshot,
  selectAllDetails,
  selectBingosById,
} from './bingosApiSlice'
import { renderBingoImage } from './shareImage'
import type { ShareLayout } from './shareImage'

interface ShareUpdateDialogProps {
  open: boolean
  bingoId: number
  onClose: () => void
}

type Phase = 'loading' | 'ready' | 'error'
type Notice = { severity: 'success' | 'info' | 'error'; message: string } | null

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'update'

const ShareUpdateDialog = ({
  open,
  bingoId,
  onClose,
}: ShareUpdateDialogProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const bingo = useAppSelector((state) => selectBingosById(state, bingoId))
  const details = useAppSelector(selectAllDetails)

  const [phase, setPhase] = useState<Phase>('loading')
  const [layout, setLayout] = useState<ShareLayout>('names')
  const [image, setImage] = useState<{
    url: string
    blob: Blob
    message: string
    namesFit: boolean
  } | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)

  // always fetch the latest data when the dialog opens
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setPhase('loading')
    setNotice(null)
    dispatch(refreshBingoSnapshot(bingoId))
      .unwrap()
      .then(() => !cancelled && setPhase('ready'))
      .catch(() => !cancelled && setPhase('error'))
    return () => {
      cancelled = true
    }
  }, [open, bingoId, dispatch])

  // draw the image whenever the data or layout changes
  useEffect(() => {
    if (!open || phase !== 'ready' || !bingo) return
    let cancelled = false
    let url: string | null = null

    renderBingoImage({
      title: bingo.title,
      raffleDate: bingo.raffleDate
        ? formatDate(new Date(bingo.raffleDate), 'PPP')
        : null,
      cells: details,
      layout,
      colors: {
        primary: theme.palette.primary.main,
        primaryText: theme.palette.primary.contrastText,
        background: theme.palette.background.default,
        surface: theme.palette.background.paper,
        text: theme.palette.text.primary,
        muted: theme.palette.text.secondary,
        border: theme.palette.divider,
      },
    })
      .then((result) => {
        if (cancelled) return
        url = URL.createObjectURL(result.blob)
        setImage({ url, ...result })
      })
      .catch(() => {
        if (!cancelled) {
          setImage(null)
          setNotice({
            severity: 'error',
            message: 'Could not generate the image. Please try again.',
          })
        }
      })

    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [open, phase, bingo, details, layout, theme])

  // drop the old image when the dialog closes
  useEffect(() => {
    if (!open) setImage(null)
  }, [open])

  const fileName = `bingo-${slugify(bingo?.title ?? '')}.png`

  const canCopy =
    typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write

  const file = useMemo(
    () =>
      image ? new File([image.blob], fileName, { type: 'image/png' }) : null,
    [image, fileName]
  )
  const canShareFiles =
    !!file &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })

  const download = () => {
    if (!image) return
    const link = document.createElement('a')
    link.href = image.url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleDownload = () => {
    try {
      download()
      setNotice({ severity: 'success', message: 'Image downloaded.' })
    } catch {
      setNotice({ severity: 'error', message: 'Could not download the image.' })
    }
  }

  const handleShare = async () => {
    if (!image || !file) return

    if (!canShareFiles) {
      // fallback: save the image so it can be posted manually
      handleDownload()
      setNotice({
        severity: 'info',
        message:
          "Sharing images isn't supported in this browser, so the image was downloaded. Attach it to your post manually.",
      })
      return
    }

    try {
      setBusy(true)
      await navigator.share({
        files: [file],
        title: bingo?.title,
        text: image.message,
      })
    } catch (err) {
      // closing the share sheet is not an error
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setNotice({
          severity: 'error',
          message: 'Sharing failed. You can download the image instead.',
        })
      }
    } finally {
      setBusy(false)
    }
  }

  const handleCopy = async () => {
    if (!image) return
    try {
      setBusy(true)
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': image.blob }),
      ])
      setNotice({
        severity: 'success',
        message: 'Image copied to the clipboard.',
      })
    } catch {
      setNotice({
        severity: 'error',
        message: 'Could not copy the image. Try downloading it instead.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Share update</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            color="primary"
            value={layout}
            onChange={(_, value: ShareLayout | null) =>
              value && setLayout(value)
            }
            aria-label="Image layout"
          >
            <ToggleButton value="names">Names in grid</ToggleButton>
            <ToggleButton value="list">Grid + list</ToggleButton>
            <ToggleButton value="private">Numbers only</ToggleButton>
          </ToggleButtonGroup>

          {phase === 'error' && (
            <Alert severity="error">
              Could not load the latest data, so no image was generated. Close
              this window and try again.
            </Alert>
          )}

          {notice && <Alert severity={notice.severity}>{notice.message}</Alert>}

          {layout === 'names' && image && !image.namesFit && (
            <Alert severity="info">
              There are too many squares to print names inside them, so they
              show as taken. Try the "Grid + list" layout to include names.
            </Alert>
          )}

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 520,
              aspectRatio: '1 / 1',
              mx: 'auto',
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.default',
            }}
          >
            {image ? (
              <Box
                component="img"
                src={image.url}
                alt={`Preview: ${image.message}`}
                sx={{ width: '100%', height: '100%', display: 'block' }}
              />
            ) : (
              phase !== 'error' && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CircularProgress />
                </Box>
              )
            )}
          </Box>

          {phase === 'ready' && image && !canShareFiles && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              This browser can't share images directly. Download the image and
              attach it to your post.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'flex-end',
        }}
      >
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="outlined"
          startIcon={<CopyIcon />}
          onClick={handleCopy}
          disabled={!image || busy || !canCopy}
          title={canCopy ? undefined : "Copying images isn't supported here"}
        >
          Copy image
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={!image || busy}
        >
          Download image
        </Button>
        <Button
          variant="contained"
          startIcon={<ShareIcon />}
          onClick={handleShare}
          disabled={!image || busy}
        >
          Share
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ShareUpdateDialog
