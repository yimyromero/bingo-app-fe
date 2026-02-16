import { Grid, styled, Paper, Box, ListItemButton, Button } from '@mui/material'
import type { BingoDetail } from './bingosApiSlice'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}))

interface BingoGridProps {
  details: BingoDetail[]
}

const BingoGrid = ({ details }: BingoGridProps) => {
  const colsPartition = Math.ceil(Math.sqrt(details.length))

  const grid = (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      {details.map((detail: BingoDetail) => (
        <Grid key={detail.id} size={{ xs: 3, sm: 12 / colsPartition }}>
          <Button
            variant="contained"
            sx={
              {
                //backgroundColor: `${!detail.participantName?.trim().length ? 'primary.main' : 'text.disabled'}`,
              }
            }
          >
            {detail.cellNumber}
          </Button>
          <Box id="hidden-detail" sx={{ display: 'none' }}>
            <span className="participant-name">{detail.participantName}</span>
            <span>{detail.bingoId}</span>
          </Box>
        </Grid>
      ))}
    </Grid>
  )

  return grid
}

export default BingoGrid
