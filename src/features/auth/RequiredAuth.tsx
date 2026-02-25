import { selectCurrentToken } from './authApiSlice'
import { useAppSelector } from '../../hooks/hooks'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import { Navigate, Outlet, useLocation } from 'react-router'

interface UserInfoPayLoad extends JwtPayload {
  userInfo: {
    email: string
    role: string
  }
}
const RequiredAuth = () => {
  const token = useAppSelector(selectCurrentToken)
  const location = useLocation()
  if (!token) {
    //const decoded = jwtDecode<UserInfoPayLoad>(token)
    //const { email, role } = decoded.userInfo
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export { RequiredAuth }
