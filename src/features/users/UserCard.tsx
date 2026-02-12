import { MoreHoriz, ShapeLine } from '@mui/icons-material'
import {
  Box,
  Chip,
  IconButton,
  ListItem,
  ListItemText,
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
}

const UserCard = ({ ...user }: UserCardType) => {
  return (
    <ListItem
      sx={{
        background: 'Background',
        borderRadius: 2,
      }}
      key={user.id}
      secondaryAction={
        <Stack
          direction="row"
          spacing={2}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Chip
            size="small"
            label={`${!user.active ? 'active' : 'inactive'}`}
            color={`${!user.active ? 'success' : 'error'}`}
            variant="outlined"
          />
          <IconButton arial-label="More options" size="small">
            <MoreHoriz />
          </IconButton>
        </Stack>
      }
    >
      <ListItemText
        primary={
          <Typography component="div" sx={{ fontWeight: 600 }}>
            {user.name}
          </Typography>
        }
        secondary={
          <Box>
            <Typography
              component="desc"
              variant="body2"
              sx={{ color: 'text.secondary' }}
            >
              {user.email}
            </Typography>
            <Typography
              variant="body2"
              aria-label="user roles"
              component="details"
            >
              Roles: {user.roles}
            </Typography>
          </Box>
        }
      ></ListItemText>
    </ListItem>
  )
}

export default UserCard
