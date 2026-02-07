import { createBrowserRouter } from 'react-router'
import UserInfo from './pages/UserInfo'

const router = createBrowserRouter([
  {
    path: '/',
    element: <UserInfo />,
  },
  {
    path: '/actions',
    element: <div>Actions go here</div>,
  },
])

export default router
