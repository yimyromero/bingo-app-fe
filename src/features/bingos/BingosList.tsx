import React, { useEffect } from 'react'
import { Link } from 'react-router'
import { useAppSelector, useAppDispatch } from '../../hooks/hooks'
import { Card, List, Stack, Typography, Button, Divider } from '@mui/material'

import {
  type Bingo,
  fetchBingos,
  selectAllBingos,
  //bingosSelector,
  selectBingosError,
  selectBingoStatus,
} from './bingosApiSlice'
import BingoCard from './BingoCard'
import type { BingoCardType } from './BingoCard'
export const BingosList = () => {
  const dispatch = useAppDispatch()
  const bingos = useAppSelector(selectAllBingos)
  const bingoStatus = useAppSelector(selectBingoStatus)
  const bingosError = useAppSelector(selectBingosError)

  useEffect(() => {
    if (bingoStatus === 'idle') {
      dispatch(fetchBingos())
    }
  }, [bingoStatus, dispatch])

  let content: React.ReactNode

  if (bingoStatus === 'pending') {
    content = <h1>Loading...</h1>
  } else if (bingoStatus === 'succeeded') {
    content = (
      <List>
        {bingos.map((bingo) => (
          <BingoCard key={bingo.id} {...bingo} />
        ))}
      </List>
    )
  } else if (bingoStatus === 'failed') {
    content = <div>{bingosError}</div>
  }

  return (
    <section>
      <Stack
        direction="row"
        sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}
      >
        <Typography variant="h4">Bingos</Typography>
        <Button variant="contained" component={Link} to="/dash/bingos/new">
          New bingo
        </Button>
      </Stack>
      {content}
    </section>
  )
}
