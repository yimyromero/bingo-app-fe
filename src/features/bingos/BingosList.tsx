import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import { useAppSelector, useAppDispatch } from '../../hooks/hooks'
import { selectCurrentToken } from '../auth/authApiSlice'
import {
  deleteBingo,
  fetchBingoPage,
  selectBingoPage,
  selectBingosError,
  selectBingoStatus,
  selectBingoTotal,
} from './bingosApiSlice'
import type { Bingo, BingoListParams, BingoSortField } from './bingosApiSlice'
import BingoCard from './BingoCard'
import ShareUpdateDialog from './ShareUpdateDialog'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/locales/en'

const PAGE_SIZE = 20

// each option is a column plus a direction
const SORT_OPTIONS: {
  value: string
  sort: BingoSortField
  order: 'asc' | 'desc'
  labelKey: TranslationKey
}[] = [
  {
    value: 'new',
    sort: 'createdAt',
    order: 'desc',
    labelKey: 'bingos.sortNewest',
  },
  {
    value: 'old',
    sort: 'createdAt',
    order: 'asc',
    labelKey: 'bingos.sortOldest',
  },
  {
    value: 'titleAsc',
    sort: 'title',
    order: 'asc',
    labelKey: 'bingos.sortTitleAsc',
  },
  {
    value: 'titleDesc',
    sort: 'title',
    order: 'desc',
    labelKey: 'bingos.sortTitleDesc',
  },
  {
    value: 'raffleSoon',
    sort: 'raffleDate',
    order: 'asc',
    labelKey: 'bingos.sortRaffleSoon',
  },
  {
    value: 'raffleLate',
    sort: 'raffleDate',
    order: 'desc',
    labelKey: 'bingos.sortRaffleLate',
  },
  {
    value: 'sizeSmall',
    sort: 'gridSize',
    order: 'asc',
    labelKey: 'bingos.sortSizeSmall',
  },
  {
    value: 'sizeLarge',
    sort: 'gridSize',
    order: 'desc',
    labelKey: 'bingos.sortSizeLarge',
  },
]

const useDebounced = <T,>(value: T, delay = 350) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export const BingosList = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const bingos = useAppSelector(selectBingoPage)
  const total = useAppSelector(selectBingoTotal)
  const status = useAppSelector(selectBingoStatus)
  const error = useAppSelector(selectBingosError)
  const token = useAppSelector(selectCurrentToken)

  const [page, setPage] = useState(0)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<BingoListParams['status']>('all')
  const [raffleFrom, setRaffleFrom] = useState('')
  const [raffleTo, setRaffleTo] = useState('')
  const [sortValue, setSortValue] = useState('new')
  const [shareId, setShareId] = useState<number | null>(null)
  const [toDelete, setToDelete] = useState<Bingo | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const search = useDebounced(searchText)
  const sortOption = SORT_OPTIONS.find((o) => o.value === sortValue)!

  let currentUserId: number | null = null
  try {
    currentUserId = token
      ? jwtDecode<JwtPayload & { userInfo: { id: number } }>(token).userInfo.id
      : null
  } catch {
    currentUserId = null
  }

  // a changed filter or order starts again from the first page
  useEffect(() => {
    setPage(0)
  }, [search, statusFilter, raffleFrom, raffleTo, sortValue])

  useEffect(() => {
    dispatch(
      fetchBingoPage({
        page,
        pageSize: PAGE_SIZE,
        search,
        status: statusFilter,
        raffleFrom,
        raffleTo,
        sort: sortOption.sort,
        order: sortOption.order,
      })
    )
  }, [dispatch, page, search, statusFilter, raffleFrom, raffleTo, sortOption])

  const filtersActive =
    searchText !== '' ||
    statusFilter !== 'all' ||
    raffleFrom !== '' ||
    raffleTo !== ''

  const clearFilters = () => {
    setSearchText('')
    setStatusFilter('all')
    setRaffleFrom('')
    setRaffleTo('')
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await dispatch(deleteBingo(toDelete.id)).unwrap()
      setToDelete(null)
    } catch {
      setDeleteError(t('bingos.deleteError'))
    } finally {
      setDeleting(false)
    }
  }

  const rangeInvalid = !!raffleFrom && !!raffleTo && raffleFrom > raffleTo

  return (
    <section>
      <Stack
        direction="row"
        sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}
      >
        <Typography variant="h4">{t('bingos.title')}</Typography>
        <Button variant="contained" component={Link} to="/dash/bingos/new">
          {t('bingos.newBingo')}
        </Button>
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ mb: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}
      >
        <TextField
          size="small"
          label={t('bingos.search')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 220, maxWidth: 360 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          label={t('common.status')}
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as BingoListParams['status'])
          }
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="all">{t('bingos.allStatuses')}</MenuItem>
          <MenuItem value="active">{t('bingos.activeChip')}</MenuItem>
          <MenuItem value="finished">{t('bingos.finishedChip')}</MenuItem>
        </TextField>
        <TextField
          size="small"
          type="date"
          label={t('bingos.dateFrom')}
          value={raffleFrom}
          onChange={(e) => setRaffleFrom(e.target.value)}
          error={rangeInvalid}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { max: raffleTo || undefined },
          }}
        />
        <TextField
          size="small"
          type="date"
          label={t('bingos.dateTo')}
          value={raffleTo}
          onChange={(e) => setRaffleTo(e.target.value)}
          error={rangeInvalid}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: raffleFrom || undefined },
          }}
        />
        <TextField
          select
          size="small"
          label={t('bingos.sortLabel')}
          value={sortValue}
          onChange={(e) => setSortValue(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {SORT_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {t(o.labelKey)}
            </MenuItem>
          ))}
        </TextField>
        {filtersActive && (
          <Button onClick={clearFilters} sx={{ alignSelf: 'center' }}>
            {t('bingos.clearFilters')}
          </Button>
        )}
      </Stack>

      {status === 'failed' && <Alert severity="error">{error}</Alert>}

      <Box sx={{ opacity: status === 'pending' && page === 0 ? 0.6 : 1 }}>
        {bingos.map((bingo) => (
          <BingoCard
            key={bingo.id}
            {...bingo}
            canShare={bingo.userId === currentUserId}
            onShare={setShareId}
            onDelete={() => {
              setDeleteError(null)
              setToDelete(bingo)
            }}
          />
        ))}
        {status !== 'pending' && status !== 'failed' && bingos.length === 0 && (
          <Typography
            sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}
          >
            {t('bingos.noResults')}
          </Typography>
        )}
      </Box>

      {total > 0 && (
        <Stack spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('bingos.showing', { shown: bingos.length, total })}
          </Typography>
          {bingos.length < total && (
            <Button
              variant="outlined"
              disabled={status === 'pending'}
              onClick={() => setPage(page + 1)}
            >
              {status === 'pending'
                ? t('common.loading')
                : t('bingos.loadMore')}
            </Button>
          )}
        </Stack>
      )}

      {shareId !== null && (
        <ShareUpdateDialog
          open
          bingoId={shareId}
          onClose={() => setShareId(null)}
        />
      )}

      <Dialog open={!!toDelete} onClose={() => !deleting && setToDelete(null)}>
        <DialogTitle>{t('bingos.deleteTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('bingos.deleteWarning', { title: toDelete?.title ?? '' })}
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)} disabled={deleting}>
            {t('common.cancel')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
            disabled={deleting}
          >
            {t('bingos.deleteBingo')}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  )
}
