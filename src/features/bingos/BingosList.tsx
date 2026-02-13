import React, { useEffect } from 'react'
import { Link } from 'react-router'
import { useAppSelector, useAppDispatch } from '../../hooks/hooks'
import { Card, List, Stack, Typography, Button, Divider } from '@mui/material'

import {
  type Bingo,
  fetchBingos,
  selectAllBingos,
  selectBingosError,
  selectBingoStatus,
} from './bingosApiSlice'
import BingoCard from './BingoCard'
import type { BingoCardType } from './BingoCard'
export const BingosList = () => {
  const dispatch = useAppDispatch()
  const bingos = useAppSelector(selectAllBingos)
  console.log(bingos, 'bingos')
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
    const orderedBingos = bingos
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    content = orderedBingos.map((bingo) => (
      // <div key={bingo.id}>
      //   <h3>{bingo.title}</h3>
      //   <span>{bingo.createdAt}</span>
      //   <span>{bingo.gridSize}</span>
      // </div>
      <List>
        <BingoCard {...bingo} />
      </List>
    ))
  } else if (bingoStatus === 'rejected') {
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
