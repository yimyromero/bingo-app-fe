import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../hooks/hooks'
import { List } from '@mui/material'

import {
  type User,
  fetchUsers,
  selectAllUsers,
  selectUsersError,
  selectUserStatus,
} from './usersApiSlice'
import UserCard from './UserCard'
import type { UserCardType } from './UserCard'
export const UsersList = () => {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectAllUsers)
  console.log(users, 'users')
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
    content = orderedUsers.map((user) => (
      <List>
        <UserCard {...user} />
      </List>
    ))
  } else if (userStatus === 'rejected') {
    content = <div>{usersError}</div>
  }

  return (
    <section>
      <h2>Users</h2>
      {content}
    </section>
  )
}
