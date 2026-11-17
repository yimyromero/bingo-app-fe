import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import NumbersIcon from '@mui/icons-material/Numbers'
import ShareIcon from '@mui/icons-material/Share'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import BingoGrid from './BingoGrid'
import BingoInfoForm from './BingoInfoForm'
import ShareUpdateDialog from './ShareUpdateDialog'

import { useAppDispatch, useAppSelector } from '../../hooks/hooks'
import { selectCurrentToken } from '../auth/authApiSlice'
import {
  selectAllDetails,
  selectDetailsStatus,
  selectDetailsError,
  fetchBingoById,
  fetchBingoDetails,
  selectBingosById,
  selectTakenCount,
} from './bingosApiSlice'
import { useTranslation } from '../../i18n/useTranslation'

const BingoView = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const details = useAppSelector(selectAllDetails)
  const detailStatus = useAppSelector(selectDetailsStatus)
  const detailError = useAppSelector(selectDetailsError)
  const takenBingoSquares = useAppSelector(selectTakenCount)
  const token = useAppSelector(selectCurrentToken)
  const [shareOpen, setShareOpen] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const { id } = useParams()
  const numericId = Number(id)
  const bingo = useAppSelector((state) => selectBingosById(state, numericId))

  useEffect(() => {
    if (!bingo) {
      dispatch(fetchBingoById(numericId))
        .unwrap()
        .catch((err: Error) => setLoadError(err.message))
    }
    dispatch(fetchBingoDetails(numericId))
  }, [numericId, bingo, dispatch])

  let content: React.ReactNode

  // only the creator of the bingo can share updates
  let currentUserId: number | null = null
  try {
    currentUserId = token
      ? jwtDecode<JwtPayload & { userInfo: { id: number } }>(token).userInfo.id
      : null
  } catch {
    currentUserId = null
  }

  if (!bingo) {
    return loadError ? (
      <h3>{loadError}</h3>
    ) : (
      <h3>{t('bingos.loadingBingo')}</h3>
    )
  }

  if (detailStatus === 'pending') {
    content = <h3>{t('common.loading')}</h3>
  } else if (detailStatus === 'succeeded') {
    content = <BingoGrid details={details} />
  } else if (detailStatus === 'failed') {
    content = <div>{detailError}</div>
  }

  return (
    <Box sx={{ width: '100%' }}>
      <BingoInfoForm key={bingo.id} bingo={bingo} />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 1,
          fontWeight: 500,
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Typography variant="inherit">{t('bingos.squares')}</Typography>
          {bingo.userId === currentUserId && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={() => setShareOpen(true)}
            >
              {t('bingos.shareUpdate')}
            </Button>
          )}
        </Stack>
        <Stack direction="row" spacing={2}>
          <Stack
            spacing={0.5}
            direction="row"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>
              {t('bingos.available')}
            </Typography>
            <Typography variant="inherit">
              {bingo.gridSize - takenBingoSquares}
            </Typography>
          </Stack>
          <Stack
            spacing={1}
            direction="row"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Typography variant="subtitle2" sx={{ color: 'GrayText' }}>
              {t('bingos.taken')}
            </Typography>
            <Typography variant="inherit">{takenBingoSquares}</Typography>
          </Stack>
        </Stack>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        {content}
      </Paper>
      <ShareUpdateDialog
        open={shareOpen}
        bingoId={bingo.id}
        onClose={() => setShareOpen(false)}
      />
    </Box>
  )
}

export default BingoView
