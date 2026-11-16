import { useState } from 'react'
import { format } from 'date-fns'
import { MoreHoriz } from '@mui/icons-material'
import {
  Chip,
  IconButton,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'

export interface UserCardType {
  id: number
  email: string
  passwordHash: string
  name: string
  roles: string
  active: boolean
  created_at?: string | null
}

interface UserCardProps extends UserCardType {
  isSelf: boolean
  onResetPassword: (user: UserCardType) => void
  onToggleStatus: (user: UserCardType) => void
}

const UserCard = ({
  isSelf,
  onResetPassword,
  onToggleStatus,
  ...user
}: UserCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const closeMenu = () => setAnchorEl(null)

  return (
    <ListItem
      sx={{
        background: 'Background',
        borderRadius: 1,
        pr: { xs: 14, sm: 16 },
      }}
      key={user.id}
      secondaryAction={
        <Stack
          direction="row"
          spacing={1}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Chip
            size="small"
            label={user.active ? 'Active' : 'Disabled'}
            color={user.active ? 'success' : 'error'}
            variant="outlined"
          />
          <IconButton
            aria-label={`More options for ${user.name}`}
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <MoreHoriz />
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}>
            <MenuItem
              onClick={() => {
                closeMenu()
                onResetPassword(user)
              }}
            >
              Send Password Reset
            </MenuItem>
            <MenuItem
              // admins can't deactivate themselves (also enforced by the API)
              disabled={user.active && isSelf}
              onClick={() => {
                closeMenu()
                onToggleStatus(user)
              }}
            >
              {user.active ? 'Deactivate Account' : 'Activate Account'}
            </MenuItem>
          </Menu>
        </Stack>
      }
    >
      <ListItemText
        primary={<Typography sx={{ fontWeight: 600 }}>{user.name}</Typography>}
        secondary={
          <>
            <Typography
              component="span"
              variant="body2"
              sx={{ color: 'text.secondary', display: 'block' }}
            >
              {user.email}
            </Typography>
            {user.created_at && (
              <Typography
                component="span"
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block' }}
              >
                Created {format(new Date(user.created_at), 'PP')}
              </Typography>
            )}
          </>
        }
        slotProps={{ secondary: { component: 'div' } }}
      ></ListItemText>
    </ListItem>
  )
}

export default UserCard
