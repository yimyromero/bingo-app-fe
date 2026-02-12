import { ThemeProvider } from '@mui/material/styles'
import Box from '@mui/material/Box'
import type { BoxProps } from '@mui/material/Box'
import { Route, RouterProvider, Routes } from 'react-router'
import styled from 'styled-components'
import router from './routes'
import theme from './theme'
import { BingosList } from './features/bingos/BingosList'
import Public from './components/Public'
import MainLayout from './components/MainLayout'

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Public />} />
        <Route path="dash" element={<MainLayout />}>
          <Route path="bingos" element={<BingosList />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App
