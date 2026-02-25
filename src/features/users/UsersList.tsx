import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../hooks/hooks'
import { Button, List, Stack, Typography } from '@mui/material'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { selectCurrentToken } from '../auth/authApiSlice'

import {
  type User,
  fetchUsers,
  selectAllUsers,
  selectUsersError,
  selectUserStatus,
} from './usersApiSlice'
import UserCard from './UserCard'
import type { UserCardType } from './UserCard'
import { AddLink } from '@mui/icons-material'
export const UsersList = () => {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectAllUsers)
  const userStatus = useAppSelector(selectUserStatus)
  const usersError = useAppSelector(selectUsersError)

  useEffect(() => {
    if (userStatus === 'idle') {
      dispatch(fetchUsers())
    }
  }, [userStatus, dispatch])

  let content: React.ReactNode

  if (userStatus === 'pending') {
    content = <h1>Loading...</h1>
  } else if (userStatus === 'succeeded') {
    const orderedUsers = users
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
    content = orderedUsers.map((user) => <UserCard key={user.id} {...user} />)
  } else if (userStatus === 'rejected') {
    content = <div>{usersError}</div>
  }

  return (
    <section>
      <Stack
        direction="row"
        sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}
      >
        <Typography variant="h4">Users</Typography>
        <Button variant="contained" component={Link} to="/dash/users/new">
          New user
        </Button>
      </Stack>
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {content}
      </List>
    </section>
  )
}
