import React, { useEffect } from 'react'
import { useParams } from 'react-router'
import {
  Avatar,
  Badge,
  Box,
  Chip,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import NumbersIcon from '@mui/icons-material/Numbers'
import BingoGrid from './BingoGrid'

import { useAppDispatch, useAppSelector } from '../../hooks/hooks'
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

  const { id } = useParams()
  const numericId = Number(id)
  const bingo = useAppSelector((state) => selectBingosById(state, numericId))

  useEffect(() => {
    if (!bingo) {
      dispatch(fetchBingos())
    }
    dispatch(fetchBingoDetails(numericId))
    console.log('effect called')
  }, [numericId, dispatch])

  let content: React.ReactNode

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
    <Container>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 1,
          fontWeight: 500,
        }}
      >
        <Typography variant="inherit">{bingo.title}</Typography>
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
    </Container>
  )
}

export default BingoView
