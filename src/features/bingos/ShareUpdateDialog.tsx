import { useEffect, useMemo, useState } from 'react'
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
import { useTranslation } from '../../i18n/useTranslation'

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
  const { t, formatDate } = useTranslation()
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
      raffleDate: bingo.raffleDate ? formatDate(bingo.raffleDate) : null,
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
      labels: {
        message: (stats) =>
          stats.total > 0 && stats.taken === stats.total
            ? t('share.image.messageAll', { total: stats.total })
            : stats.taken === 0
              ? t('share.image.messageNone', { total: stats.total })
              : t('share.image.messageSome', {
                  taken: stats.taken,
                  total: stats.total,
                }),
        raffle: (date) => t('share.image.raffle', { date }),
        taken: t('share.image.taken'),
        available: t('share.image.available'),
        total: t('share.image.total'),
        filled: t('share.image.filled'),
        takenSpots: t('share.image.takenSpots'),
        legendTaken: t('share.image.legendTaken'),
        legendAvailable: t('share.image.legendAvailable'),
        cellTaken: t('share.image.cellTaken'),
        cellAvailable: t('share.image.cellAvailable'),
        more: (count) => t('share.image.more', { count }),
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
            message: t('share.generateError'),
          })
        }
      })

    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [open, phase, bingo, details, layout, theme, t, formatDate])

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
      setNotice({ severity: 'success', message: t('share.downloaded') })
    } catch {
      setNotice({ severity: 'error', message: t('share.downloadError') })
    }
  }

  const handleShare = async () => {
    if (!image || !file) return

    if (!canShareFiles) {
      // fallback: save the image so it can be posted manually
      handleDownload()
      setNotice({
        severity: 'info',
        message: t('share.shareFallback'),
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
          message: t('share.shareError'),
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
        message: t('share.copied'),
      })
    } catch {
      setNotice({
        severity: 'error',
        message: t('share.copyError'),
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
      <DialogTitle>{t('share.title')}</DialogTitle>
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
            aria-label={t('share.layoutLabel')}
          >
            <ToggleButton value="names">{t('share.layoutNames')}</ToggleButton>
            <ToggleButton value="list">{t('share.layoutList')}</ToggleButton>
            <ToggleButton value="private">
              {t('share.layoutPrivate')}
            </ToggleButton>
          </ToggleButtonGroup>

          {phase === 'error' && (
            <Alert severity="error">{t('share.loadError')}</Alert>
          )}

          {notice && <Alert severity={notice.severity}>{notice.message}</Alert>}

          {layout === 'names' && image && !image.namesFit && (
            <Alert severity="info">{t('share.namesTooMany')}</Alert>
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
                alt={t('share.previewAlt', { message: image.message })}
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
              {t('share.noShareSupport')}
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
        <Button onClick={onClose}>{t('common.close')}</Button>
        <Button
          variant="outlined"
          startIcon={<CopyIcon />}
          onClick={handleCopy}
          disabled={!image || busy || !canCopy}
          title={canCopy ? undefined : t('share.copyUnsupported')}
        >
          {t('share.copy')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={!image || busy}
        >
          {t('share.download')}
        </Button>
        <Button
          variant="contained"
          startIcon={<ShareIcon />}
          onClick={handleShare}
          disabled={!image || busy}
        >
          {t('share.share')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ShareUpdateDialog
