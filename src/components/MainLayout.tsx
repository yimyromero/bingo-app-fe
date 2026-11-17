import Toolbar from '@mui/material/Toolbar'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import UsersIcon from '@mui/icons-material/Group'
import ListIcon from '@mui/icons-material/List'
import AccountSettingsIcons from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import { useState } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { AppBar, Button, IconButton, Typography } from '@mui/material'
import { NavLink, Outlet, replace, useNavigate } from 'react-router'
import { useAppDispatch } from '../hooks/hooks'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import { useAppSelector } from '../hooks/hooks'
import { useTranslation } from '../i18n/useTranslation'
import type { TranslationKey } from '../i18n/locales/en'
import LanguageSwitcher from './LanguageSwitcher'
import { logout, selectCurrentToken } from '../features/auth/authApiSlice'

const drawerWidth = 240

interface MenuOption {
  labelKey: TranslationKey
  path?: string
  action?: string
  icon: React.ReactNode
}
const primaryMenuOptions: MenuOption[] = [
  {
    labelKey: 'nav.dashboard',
    path: '/dash',
    icon: <DashboardIcon />,
  },
  {
    labelKey: 'nav.users',
    path: '/dash/users',
    icon: <UsersIcon />,
  },
  {
    labelKey: 'nav.bingos',
    path: '/dash/bingos',
    icon: <ListIcon />,
  },
]
const secondaryMenuOptions: MenuOption[] = [
  {
    labelKey: 'nav.account',
    path: '/dash/account',
    icon: <AccountSettingsIcons />,
  },
  { labelKey: 'nav.logout', action: 'logout', icon: <LogoutIcon /> },
]

const isAdmin = (token: string | null) => {
  if (!token) return false
  try {
    const { userInfo } = jwtDecode<JwtPayload & { userInfo: { role: string } }>(
      token
    )
    return userInfo?.role === 'admin'
  } catch {
    return false
  }
}

const MainLayout = () => {
  const { t } = useTranslation()
  const token = useAppSelector(selectCurrentToken)
  // user management is admin only (the API enforces it too)
  const visiblePrimaryOptions = primaryMenuOptions.filter(
    (option) => option.path !== '/dash/users' || isAdmin(token)
  )
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)

  const handleDrawerClose = () => {
    setIsClosing(true)
    setMobileOpen(false)
  }

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false)
  }

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen)
    }
  }

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleLogout = async () => {
    try {
      const loggedOut = await dispatch(logout())
      if (loggedOut) {
        navigate('/login', { replace: true })
      }
    } catch (err) {
      console.error('Something went wrong logging out', err)
    }
  }

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {visiblePrimaryOptions.map((option) => (
          <ListItem key={option.labelKey} disablePadding>
            <ListItemButton
              component={NavLink}
              to={option.path ?? '/dash'}
              end
              sx={{
                '&.active': {
                  backgroundColor: 'action.selected',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon>{option.icon}</ListItemIcon>
              <ListItemText primary={t(option.labelKey)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {secondaryMenuOptions.map((option) => (
          <ListItem key={option.labelKey} disablePadding>
            <ListItemButton
              component={option.path ? NavLink : 'button'}
              to={option.path}
              onClick={option.action === 'logout' ? handleLogout : undefined}
              sx={{
                '&.active': {
                  backgroundColor: 'action.selected',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon>{option.icon}</ListItemIcon>
              <ListItemText primary={t(option.labelKey)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label={t('nav.openDrawer')}
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { md: 'none' },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
              }}
            >
              {t('common.appName')}
            </Typography>
            <Box
              sx={{
                flexGrow: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <LanguageSwitcher />
              <Tooltip title={t('nav.openSettings')}>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {secondaryMenuOptions.map((option) => (
                  <ListItem key={option.labelKey} disablePadding>
                    <ListItemButton
                      component={option.path ? NavLink : 'button'}
                      to={option.path}
                      onClick={
                        option.action === 'logout' ? handleLogout : undefined
                      }
                    >
                      <ListItemIcon>{option.icon}</ListItemIcon>
                      <ListItemText primary={t(option.labelKey)} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label={t('nav.menuOptions')}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          sx={{
            display: { sm: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          slotProps={{
            root: {
              keepMounted: true,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}

export default MainLayout
