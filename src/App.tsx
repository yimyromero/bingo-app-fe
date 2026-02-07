import { ThemeProvider } from '@mui/material/styles'
import Box from '@mui/material/Box'
import type { BoxProps } from '@mui/material/Box'
import { RouterProvider } from 'react-router'
import styled from 'styled-components'
import router from './routes'
import theme from './theme'

const AppContainer = styled(Box)<BoxProps>`
  display: flex;
  background-color: lightgray;
`

const CurrentScreen = styled(Box)<BoxProps>`
  width: calc(100% - 240px);
  margin-left: 240px;
`
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppContainer component="main">
        <CurrentScreen component="section">
          <RouterProvider router={router} />
        </CurrentScreen>
      </AppContainer>
    </ThemeProvider>
  )
}

export default App
