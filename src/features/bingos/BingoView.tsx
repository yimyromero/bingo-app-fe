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
  selectCurrentBingoId,
} from './bingosApiSlice'
import { useSelector } from 'react-redux'

const BingoView = () => {
  const dispatch = useAppDispatch()
  const details = useAppSelector(selectAllDetails)
  console.log(details[0], 'details')
  const detailStatus = useAppSelector(selectDetailsStatus)
  const detailError = useAppSelector(selectDetailsError)
  const currentBingoId = useSelector(selectCurrentBingoId)

  const { id } = useParams()
  const numericId = Number(id)
  console.log(currentBingoId, 'current', numericId)
  console.log(numericId !== currentBingoId)

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
        <Typography variant="h6">Placedholder</Typography>
        <Stack direction="row" spacing={2}>
          <Badge badgeContent="12" color="secondary">
            <NumbersIcon color="action" />
          </Badge>
          <Badge badgeContent="28" color="warning">
            <NumbersIcon color="action" />
          </Badge>
          <Badge badgeContent="40" color="primary">
            <NumbersIcon color="action" />
          </Badge>
        </Stack>
      </Box>
      {content}
    </Container>
  )
}

export default BingoView
