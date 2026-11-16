import { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'
import {
  refreshSession,
  selectCurrentToken,
  selectSessionChecked,
} from './authApiSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/hooks'
import { Navigate, Outlet, useLocation } from 'react-router'

const RequiredAuth = () => {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectCurrentToken)
  const sessionChecked = useAppSelector(selectSessionChecked)
  const location = useLocation()

  // no token in memory (e.g. page reload): try to restore it with the refresh cookie
  useEffect(() => {
    if (!token && !sessionChecked) {
      dispatch(refreshSession())
    }
  }, [token, sessionChecked, dispatch])

  if (token) {
    return <Outlet />
  }

  if (!sessionChecked) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 14 }}>
        <CircularProgress />
      </Box>
    )
  }

  return <Navigate to="/login" state={{ from: location }} replace />
}

export { RequiredAuth }
