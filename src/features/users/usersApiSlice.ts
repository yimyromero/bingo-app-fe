import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { createAppAsyncThunk } from '../../withTypes'

export interface User {
  id: number
  email: string
  passwordHash: string
  name: string
  roles: string
  active: boolean
}

type UserUpdated = Pick<
  User,
  'id' | 'email' | 'passwordHash' | 'name' | 'roles' | 'active'
>
type NewUser = Pick<User, 'email' | 'name' | 'passwordHash'>

interface UsersState {
  users: User[]
  status: 'idle' | 'pending' | 'succeeded' | 'rejected'
  error: string | null
}

export const fetchUsers = createAppAsyncThunk(
  'users/fetchUsers',
  async () => {
    const response = await fetch('http://localhost:3000/users', {
      method: 'GET',
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(`Response status: ${response.statusText}`)
    }
    return result.data
  },
  {
    // runs at the start of the thunk call
    condition(arg, thunkApi) {
      const usersStatus = selectUserStatus(thunkApi.getState())
      if (usersStatus !== 'idle') {
        return false
      }
    },
  }
)

const initialState: UsersState = {
  users: [],
  status: 'idle',
  error: null,
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    userUpdated(state, action: PayloadAction<UserUpdated>) {
      const { id, email, name, passwordHash, roles, active } = action.payload
      const existingUser = state.users.find((user) => user.id === id)
      if (existingUser) {
        existingUser.email = email
        existingUser.name = name
        existingUser.passwordHash = passwordHash
        existingUser.roles = roles
        existingUser.active = active
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state, action) => {
        state.status = 'pending'
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'rejected'
        state.error = action.error.message ?? 'Unknown Error'
      })
  },
})

export const { userUpdated } = usersSlice.actions
export default usersSlice.reducer
export const selectAllUsers = (state: RootState) => state.users.users
export const selectUsersById = (state: RootState, userId: number) =>
  state.users.users.find((user) => user.id === userId)
export const selectUserStatus = (state: RootState) => state.users.status
export const selectUsersError = (state: RootState) => state.users.error
