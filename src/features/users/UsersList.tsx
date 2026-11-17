import React, { useEffect, useMemo, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../../hooks/hooks'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Link } from 'react-router'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import { selectCurrentToken } from '../auth/authApiSlice'

import {
  fetchUsers,
  selectAllUsers,
  selectUsersError,
  selectUserStatus,
  sendPasswordReset,
  updateUserStatus,
} from './usersApiSlice'
import UserCard from './UserCard'
import type { UserCardType } from './UserCard'
import { useTranslation } from '../../i18n/useTranslation'

interface TokenPayload extends JwtPayload {
  userInfo: { id: number; role: string }
}

type StatusFilter = 'all' | 'active' | 'disabled'
type PendingAction = { type: 'reset' | 'status'; user: UserCardType } | null

export const UsersList = () => {
  const { t, tServer } = useTranslation()
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectAllUsers)
  const userStatus = useAppSelector(selectUserStatus)
  const usersError = useAppSelector(selectUsersError)
  const token = useAppSelector(selectCurrentToken)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [pending, setPending] = useState<PendingAction>(null)
  const [working, setWorking] = useState(false)
  const [notice, setNotice] = useState<{
    severity: 'success' | 'error'
    message: string
  } | null>(null)

  const currentUser = token ? jwtDecode<TokenPayload>(token).userInfo : null

  const visibleUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    return users
      .filter((user) => {
        if (statusFilter === 'active' && !user.active) return false
        if (statusFilter === 'disabled' && user.active) return false
        return (
          !term ||
          user.name?.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
        )
      })
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
  }, [users, search, statusFilter])

  const handleConfirm = async () => {
    if (!pending) return
    const { type, user } = pending

    try {
      setWorking(true)
      let message: string
      if (type === 'reset') {
        await dispatch(sendPasswordReset(user.id)).unwrap()
        message = t('users.resetSent', { email: user.email })
      } else {
        await dispatch(
          updateUserStatus({ id: user.id, active: !user.active })
        ).unwrap()
        message = user.active ? t('users.deactivated') : t('users.activated')
      }
      setNotice({ severity: 'success', message })
    } catch (err) {
      setNotice({
        severity: 'error',
        message:
          err instanceof Error
            ? tServer(err.message)
            : t('common.somethingWrong'),
      })
    } finally {
      setWorking(false)
      setPending(null)
    }
  }

  useEffect(() => {
    if (userStatus === 'idle') {
      dispatch(fetchUsers())
    }
  }, [userStatus, dispatch])

  let content: React.ReactNode

  if (userStatus === 'pending') {
    content = <h1>{t('common.loading')}</h1>
  } else if (userStatus === 'succeeded') {
    content = visibleUsers.length ? (
      visibleUsers.map((user) => (
        <UserCard
          key={user.id}
          {...user}
          isSelf={user.id === currentUser?.id}
          onResetPassword={(u) => setPending({ type: 'reset', user: u })}
          onToggleStatus={(u) => setPending({ type: 'status', user: u })}
        />
      ))
    ) : (
      <Typography sx={{ color: 'text.secondary' }}>
        {t('users.none')}
      </Typography>
    )
  } else if (userStatus === 'rejected') {
    content = <div>{usersError}</div>
  }

  return (
    <section>
      <Stack
        direction="row"
        sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}
      >
        <Typography variant="h4">{t('users.title')}</Typography>
        <Button variant="contained" component={Link} to="/dash/users/new">
          {t('users.newUser')}
        </Button>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label={t('users.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <TextField
          select
          size="small"
          label={t('common.status')}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          sx={{ minWidth: { sm: 160 } }}
        >
          <MenuItem value="all">{t('common.all')}</MenuItem>
          <MenuItem value="active">{t('common.active')}</MenuItem>
          <MenuItem value="disabled">{t('common.disabled')}</MenuItem>
        </TextField>
      </Stack>
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {content}
      </List>

      <Dialog open={!!pending} onClose={() => !working && setPending(null)}>
        <DialogTitle>
          {pending?.type === 'reset'
            ? t('users.resetTitle')
            : pending?.user.active
              ? t('users.deactivateTitle')
              : t('users.activateTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Typography sx={{ fontWeight: 600 }}>
              {pending?.user.name}
            </Typography>
            <Typography sx={{ mb: 2 }}>{pending?.user.email}</Typography>
            {pending?.type === 'reset'
              ? t('users.resetBody')
              : pending?.user.active
                ? t('users.deactivateBody')
                : t('users.activateBody')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setPending(null)}
            disabled={working}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            color={
              pending?.type === 'status' && pending.user.active
                ? 'error'
                : 'primary'
            }
            onClick={handleConfirm}
            disabled={working}
          >
            {pending?.type === 'reset'
              ? t('users.sendEmail')
              : pending?.user.active
                ? t('users.deactivate')
                : t('users.activate')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!notice}
        autoHideDuration={6000}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notice ? (
          <Alert
            severity={notice.severity}
            onClose={() => setNotice(null)}
            variant="filled"
          >
            {notice.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </section>
  )
}
