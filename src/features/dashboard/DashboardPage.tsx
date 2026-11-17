import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { formatDate, formatDistanceToNow, isPast } from 'date-fns'
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import {
  Add as AddIcon,
  Event as EventIcon,
  Share as ShareIcon,
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../../hooks/hooks'
import ShareUpdateDialog from '../bingos/ShareUpdateDialog'
import {
  fetchDashboard,
  selectDashboardBingos,
  selectDashboardError,
  selectDashboardRecent,
  selectDashboardStatus,
} from './dashboardApiSlice'
import type { DashboardBingo } from './dashboardApiSlice'

const NEARLY_FULL = 0.9

const percent = (b: DashboardBingo) =>
  b.gridSize ? Math.round((b.taken / b.gridSize) * 100) : 0

const StatTile = ({ label, value }: { label: string; value: number }) => (
  <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 140 }}>
    <Typography variant="h4" sx={{ fontWeight: 700 }}>
      {value}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
  </Paper>
)

const BingoRow = ({
  bingo,
  onShare,
}: {
  bingo: DashboardBingo
  onShare: (id: number) => void
}) => {
  const pct = percent(bingo)
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography
          component={Link}
          to={`/dash/bingos/${bingo.id}/view`}
          sx={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}
          noWrap
        >
          {bingo.title}
        </Typography>
        <Button
          size="small"
          startIcon={<ShareIcon />}
          onClick={() => onShare(bingo.id)}
        >
          Share
        </Button>
      </Stack>
      {bingo.raffleDate && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <EventIcon sx={{ fontSize: 16 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {formatDate(new Date(bingo.raffleDate), 'PPP')}
          </Typography>
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ height: 8, borderRadius: 4, mt: 1.5 }}
      />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {bingo.taken} of {bingo.gridSize} taken ({pct}%)
      </Typography>
    </Paper>
  )
}

const DashboardPage = () => {
  const dispatch = useAppDispatch()
  const bingos = useAppSelector(selectDashboardBingos)
  const recent = useAppSelector(selectDashboardRecent)
  const status = useAppSelector(selectDashboardStatus)
  const error = useAppSelector(selectDashboardError)
  const [shareId, setShareId] = useState<number | null>(null)

  // refresh on every visit so the numbers are current
  useEffect(() => {
    dispatch(fetchDashboard())
  }, [dispatch])

  const { active, upcoming, attention, totals } = useMemo(() => {
    const active = bingos.filter((b) => !b.isDone)
    const upcoming = active
      .filter((b) => !b.raffleDate || !isPast(new Date(b.raffleDate)))
      .slice(0, 5)
    const attention = active.flatMap((b) => {
      const notes: string[] = []
      if (b.raffleDate && isPast(new Date(b.raffleDate))) {
        notes.push('Draw date has passed, not marked as finished')
      }
      if (b.gridSize && b.taken >= b.gridSize) {
        notes.push('All spots are taken')
      } else if (b.gridSize && b.taken / b.gridSize >= NEARLY_FULL) {
        notes.push(`Nearly full, ${b.gridSize - b.taken} spots left`)
      }
      return notes.map((note) => ({ bingo: b, note }))
    })
    const totals = active.reduce(
      (sum, b) => ({
        taken: sum.taken + b.taken,
        available: sum.available + (b.gridSize - b.taken),
      }),
      { taken: 0, available: 0 }
    )
    return { active, upcoming, attention, totals }
  }, [bingos])

  const loading = status === 'pending' && !bingos.length

  return (
    <Box component="section">
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
      >
        <Typography variant="h4">Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/dash/bingos/new"
        >
          New bingo
        </Button>
      </Stack>

      {status === 'failed' && <Alert severity="error">{error}</Alert>}
      {loading && <Typography>Loading...</Typography>}

      {status !== 'failed' && !loading && (
        <Stack spacing={4}>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
            <StatTile label="Active bingos" value={active.length} />
            <StatTile label="Spots taken" value={totals.taken} />
            <StatTile label="Spots available" value={totals.available} />
          </Stack>

          {attention.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Needs attention
              </Typography>
              <Stack spacing={1}>
                {attention.map(({ bingo, note }) => (
                  <Alert
                    key={`${bingo.id}-${note}`}
                    severity="warning"
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        component={Link}
                        to={`/dash/bingos/${bingo.id}/view`}
                      >
                        Open
                      </Button>
                    }
                  >
                    <strong>{bingo.title}</strong>: {note}
                  </Alert>
                ))}
              </Stack>
            </Box>
          )}

          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Upcoming raffles
            </Typography>
            {upcoming.length ? (
              <Stack spacing={2}>
                {upcoming.map((b) => (
                  <BingoRow key={b.id} bingo={b} onShare={setShareId} />
                ))}
              </Stack>
            ) : (
              <Typography sx={{ color: 'text.secondary' }}>
                No upcoming raffles. Create a bingo to get started.
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Recent activity
            </Typography>
            {recent.length ? (
              <Stack spacing={1}>
                {recent.map((r) => (
                  <Paper
                    key={`${r.bingoId}-${r.cellNumber}`}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Chip size="small" color="primary" label={r.cellNumber} />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography noWrap>
                        {r.participantName} took spot {r.cellNumber}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary' }}
                      >
                        {r.bingoTitle}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
                    >
                      {formatDistanceToNow(new Date(r.takenAt), {
                        addSuffix: true,
                      })}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography sx={{ color: 'text.secondary' }}>
                No spots taken yet.
              </Typography>
            )}
          </Box>
        </Stack>
      )}

      {shareId !== null && (
        <ShareUpdateDialog
          open
          bingoId={shareId}
          onClose={() => setShareId(null)}
        />
      )}
    </Box>
  )
}

export default DashboardPage
