import { useState } from 'react'
import { Link } from 'react-router'
import {
  Event as EventIcon,
  GridOn,
  MoreHoriz,
  Edit as EditIcon,
  Share as ShareIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useTranslation } from '../../i18n/useTranslation'

export interface BingoCardType {
  id: number
  title: string
  gridSize: number
  raffleDate: string
  isDone?: boolean
  canShare?: boolean
  onShare?: (id: number) => void
  onDelete?: (id: number) => void
}

const BingoCard = ({
  id,
  title,
  gridSize,
  raffleDate,
  isDone,
  canShare,
  onShare,
  onDelete,
}: BingoCardType) => {
  const { t, formatDate } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const closeMenu = () => setAnchorEl(null)

  const viewPath = `/dash/bingos/${id}/view`

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': { boxShadow: 2, borderColor: 'primary.main' },
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component={Link}
            to={viewPath}
            noWrap
            sx={{
              fontWeight: 600,
              color: 'inherit',
              textDecoration: 'none',
              display: 'block',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {title}
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 0.5, flexWrap: 'wrap', color: 'text.secondary' }}
          >
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <EventIcon sx={{ fontSize: 16 }} />
              <Typography component="time" variant="body2">
                {raffleDate ? formatDate(raffleDate) : '—'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <GridOn sx={{ fontSize: 14 }} />
              <Typography variant="body2">{gridSize}</Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip
            size="small"
            label={isDone ? t('bingos.finishedChip') : t('bingos.activeChip')}
            color={isDone ? 'error' : 'primary'}
            variant="outlined"
          />
          <Button
            size="small"
            variant="outlined"
            component={Link}
            to={viewPath}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            {t('bingos.open')}
          </Button>
          <IconButton
            size="small"
            aria-label={t('bingos.moreOptions')}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <MoreHoriz />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem component={Link} to={viewPath} onClick={closeMenu}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('bingos.edit')}</ListItemText>
            </MenuItem>
            {canShare && onShare && (
              <MenuItem
                onClick={() => {
                  closeMenu()
                  onShare(id)
                }}
              >
                <ListItemIcon>
                  <ShareIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('bingos.shareUpdate')}</ListItemText>
              </MenuItem>
            )}
            {onDelete && (
              <MenuItem
                sx={{ color: 'error.main' }}
                onClick={() => {
                  closeMenu()
                  onDelete(id)
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('bingos.deleteBingo')}</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default BingoCard
