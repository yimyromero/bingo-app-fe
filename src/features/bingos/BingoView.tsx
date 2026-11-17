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
  fetchBingos,
  fetchBingoDetails,
  selectBingosById,
  selectTakenCount,
} from './bingosApiSlice'

const BingoView = () => {
  const dispatch = useAppDispatch()
  const details = useAppSelector(selectAllDetails)
  const detailStatus = useAppSelector(selectDetailsStatus)
  const detailError = useAppSelector(selectDetailsError)
  const takenBingoSquares = useAppSelector(selectTakenCount)
  const token = useAppSelector(selectCurrentToken)
  const [shareOpen, setShareOpen] = useState(false)

  const { id } = useParams()
  const numericId = Number(id)
  const bingo = useAppSelector((state) => selectBingosById(state, numericId))

  useEffect(() => {
    if (!bingo) {
      dispatch(fetchBingos())
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
    return <h3>Loading bingo</h3>
  }

  if (detailStatus === 'pending') {
    content = <h3>Loading</h3>
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
          <Typography variant="inherit">Squares</Typography>
          {bingo.userId === currentUserId && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={() => setShareOpen(true)}
            >
              Share Update
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
              Available:
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
              Taken:
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
