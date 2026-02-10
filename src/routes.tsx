import { createBrowserRouter } from 'react-router'
import UserInfo from './pages/UserInfo'
import { BingosList } from './features/bingos/BingosList'

const router = createBrowserRouter([
  {
    path: '/',
    element: <UserInfo />,
  },
  {
    path: '/actions',
    element: <div>Actions go here</div>,
  },
  {
    path: '/bingos',
    element: <BingosList />,
  },
])

export default router
