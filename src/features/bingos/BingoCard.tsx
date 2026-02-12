import { MoreHoriz } from '@mui/icons-material'
import {
  Box,
  Chip,
  IconButton,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'

export interface BingoCardType {
  id: number
  title: string
  gridSize: number
  raffleDate?: string
  isDone?: boolean
}

const BingoCard = (card: BingoCardType) => {
  return (
    <ListItem
      sx={{
        background: 'white',
      }}
      key={card.id}
      secondaryAction={
        <Stack
          direction="row"
          spacing={2}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Chip
            size="small"
            label={`${!card.isDone ? 'active' : 'finished'}`}
            color={`${!card.isDone ? 'success' : 'error'}`}
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
            {card.title}
          </Typography>
        }
        secondary={
          <Box>
            <Typography
              component="time"
              variant="body2"
              sx={{ color: 'text.secondary' }}
            >
              {card.raffleDate}
            </Typography>
            <Typography># {card.gridSize}</Typography>
          </Box>
        }
      ></ListItemText>
    </ListItem>
  )
}

export default BingoCard
