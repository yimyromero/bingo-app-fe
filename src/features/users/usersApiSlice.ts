import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { createAppAsyncThunk } from '../../withTypes'
import { authFetch } from '../../api/authFetch'

export interface User {
  id: number
  email: string
  passwordHash: string
  name: string
  roles: string
  active: boolean
  created_at?: string | null
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
  async (_, thunkApi) => {
    const response = await authFetch(thunkApi, `/users`, {
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

export const addNewUser = createAppAsyncThunk(
  'users/addNewUser',
  async (initialUser: NewUser, thunkApi) => {
    const { passwordHash, ...rest } = initialUser
    const response = await authFetch(thunkApi, `/users`, {
      method: 'POST',
      body: JSON.stringify({
        ...rest,
        password_hash: passwordHash,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(`Response status: ${response.statusText}`)
    }
    return result.data
  }
)

// Activate or deactivate an account (admin only)
export const updateUserStatus = createAppAsyncThunk(
  'users/updateUserStatus',
  async ({ id, active }: { id: number; active: boolean }, thunkApi) => {
    const response = await authFetch(thunkApi, `/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result?.message ?? 'Could not update the account.')
    }
    return {
      ...(result.data as { id: number; active: boolean }),
      message: result.message as string,
    }
  }
)

// Email a password reset link to the user (admin only)
export const sendPasswordReset = createAppAsyncThunk(
  'users/sendPasswordReset',
  async (id: number, thunkApi) => {
    const response = await authFetch(thunkApi, `/users/${id}/password-reset`, {
      method: 'POST',
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result?.message ?? 'Could not send the reset email.')
    }
    return result.message as string
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
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.id === action.payload.id)
        if (user) {
          user.active = action.payload.active
        }
      })
      .addCase(addNewUser.fulfilled, (state, action) => {
        state.users.push(action.payload)
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
