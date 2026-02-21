import { useState } from 'react'
import { Link } from 'react-router'
import { MoreHoriz, ShapeLine } from '@mui/icons-material'
import {
  Box,
  Chip,
  IconButton,
  ListItem,
  ListItemText,
  Button,
  Stack,
  Typography,
  Menu,
  MenuItem,
  ListItemButton,
} from '@mui/material'

export interface BingoCardType {
  id: number
  title: string
  gridSize: number
  raffleDate?: string
  isDone?: boolean
}

const BingoCard = ({ ...card }: BingoCardType) => {
  const settings = ['View', 'Edit']
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  return (
    <ListItem
      sx={{
        background: 'Background',
        borderRadius: 2,
        mb: 2,
      }}
      secondaryAction={
        <Stack
          direction="row"
          spacing={2}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Chip
            size="small"
            label={`${!card.isDone ? 'active' : 'finished'}`}
            color={`${!card.isDone ? 'primary' : 'error'}`}
            variant="outlined"
          />
          <Box>
            <IconButton
              onClick={handleOpenUserMenu}
              arial-label="More options"
              size="small"
            >
              <MoreHoriz />
            </IconButton>
            <Menu
              sx={{ mt: '30px' }}
              id="menu-row"
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
              {settings.map((setting) => (
                <ListItem
                  key={setting}
                  onClick={handleCloseUserMenu}
                  disablePadding
                  dense
                >
                  <ListItemButton
                    component={Link}
                    to={`/dash/bingos/${card.id}/view`}
                    sx={{ textAlign: 'center' }}
                  >
                    {setting}
                  </ListItemButton>
                </ListItem>
              ))}
            </Menu>
          </Box>
        </Stack>
      }
    >
      <ListItemText
        primary={<Typography sx={{ fontWeight: 600 }}>{card.title}</Typography>}
        secondary={
          <>
            <Typography
              component="time"
              variant="body2"
              sx={{ color: 'text.secondary' }}
            >
              {card.raffleDate}
            </Typography>
            <Typography
              component="span"
              variant="body2"
              sx={{ display: 'block' }}
            >
              # {card.gridSize}
            </Typography>
          </>
        }
      ></ListItemText>
    </ListItem>
  )
}

export default BingoCard
