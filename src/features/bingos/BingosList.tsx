import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../hooks/hooks'

import {
  type Bingo,
  fetchBingos,
  selectAllBingos,
  selectBingosError,
  selectBingoStatus,
} from './bingosApiSlice'
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
      <div key={bingo.id}>
        <h3>{bingo.title}</h3>
        <span>{bingo.createdAt}</span>
        <span>{bingo.gridSize}</span>
      </div>
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
