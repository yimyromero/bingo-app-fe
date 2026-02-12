import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../hooks/hooks'
import { Card, List } from '@mui/material'

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
      <h2>Bingos</h2>
      {content}
    </section>
  )
}
