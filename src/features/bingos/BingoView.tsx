import {
  Avatar,
  Badge,
  Box,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import NumbersIcon from '@mui/icons-material/Numbers'
import BingoGrid from './BingoGrid'

const BingoView = () => {
  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Placedholder</Typography>
        <Stack direction="row" spacing={2}>
          <Badge badgeContent="12" color="secondary">
            <NumbersIcon color="action" />
          </Badge>
          <Badge badgeContent="28" color="warning">
            <NumbersIcon color="action" />
          </Badge>
          <Badge badgeContent="40" color="primary">
            <NumbersIcon color="action" />
          </Badge>
        </Stack>
      </Box>
      <BingoGrid />
    </Container>
  )
}

export default BingoView
