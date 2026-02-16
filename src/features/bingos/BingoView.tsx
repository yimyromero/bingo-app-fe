import React, { useEffect } from 'react'
import { useParams } from 'react-router'
import {
  Avatar,
  Badge,
  Box,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import NumbersIcon from '@mui/icons-material/Numbers'
import BingoGrid from './BingoGrid'

import { useAppDispatch, useAppSelector } from '../../hooks/hooks'
import {
  selectAllDetails,
  selectDetailsStatus,
  selectDetailsError,
  fetchBingoDetails,
  selectBingosById,
  selectTakenCount,
} from './bingosApiSlice'

const BingoView = () => {
  const dispatch = useAppDispatch()
  const details = useAppSelector(selectAllDetails)
  console.log(details[0], 'details')
  const detailStatus = useAppSelector(selectDetailsStatus)
  const detailError = useAppSelector(selectDetailsError)
  const takenBingoSquares = useAppSelector(selectTakenCount)
  console.log('taken', takenBingoSquares)

  const { id } = useParams()
  const numericId = Number(id)
  const bingo = useAppSelector((state) => selectBingosById(state, numericId))

  useEffect(() => {
    dispatch(fetchBingoDetails(numericId))
  }, [numericId, dispatch])

  let content: React.ReactNode

  if (detailStatus === 'pending') {
    content = <h3>Loading</h3>
  } else if (detailStatus === 'succeeded') {
    content = <BingoGrid details={details} />
  } else if (detailStatus === 'failed') {
    content = <div>{detailError}</div>
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">{bingo.title}</Typography>
        <Stack direction="row" spacing={2}>
          <Badge
            badgeContent={bingo.gridSize - takenBingoSquares}
            color="secondary"
          >
            <NumbersIcon color="action" />
          </Badge>
          <Badge badgeContent={takenBingoSquares.toString()} color="warning">
            <NumbersIcon color="action" />
          </Badge>
          <Badge
            badgeContent={bingo.gridSize}
            color="primary"
            aria-label="number of squares"
          >
            <NumbersIcon color="action" />
          </Badge>
        </Stack>
      </Box>
      {content}
    </Container>
  )
}

export default BingoView
