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
import { UsersList } from './features/users/UsersList'
import AddUser from './features/users/AddUser'
import AddBingo from './features/bingos/AddBingo'
import BingoView from './features/bingos/BingoView'
import AccountPage from './features/account/AccountPage'
import { Login } from './features/auth/Login'
import { ResetPassword } from './features/auth/ResetPassword'
import { RequiredAuth } from './features/auth/RequiredAuth'

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Public />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<RequiredAuth />}>
          <Route path="dash" element={<MainLayout />}>
            <Route path="bingos">
              <Route index element={<BingosList />} />
              <Route path=":id" />
              <Route path="new" element={<AddBingo />} />
              <Route path=":id/view" element={<BingoView />} />
            </Route>
            <Route path="account" element={<AccountPage />} />
            <Route path="users">
              <Route index element={<UsersList />} />
              <Route path=":id" />
              <Route path="new" element={<AddUser />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App
