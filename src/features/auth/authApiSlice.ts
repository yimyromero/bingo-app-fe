import { createSlice } from '@reduxjs/toolkit'
import { createAppAsyncThunk } from '../../withTypes'
import type { User } from '../users/usersApiSlice'
import type { RootState } from '../../store'

type Status = 'idle' | 'pending' | 'succeeded' | 'failed'

interface TokenState {
  token: string | null
  status: Status
  error: string | null
}

type Login = Pick<User, 'email' | 'passwordHash'>

export const login = createAppAsyncThunk(
  'auth/login',
  async ({ email, passwordHash: password }: Login) => {
    const response = await fetch(`http://localhost:3000/auth`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Response status: ${response.statusText}`)
    }

    return result
  }
)

const initialState: TokenState = {
  token: null,
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state, action) => {
        state.status = 'pending'
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.token = action.payload.accessToken
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.error.message ?? 'Unknown Error'
      })
  },
})

export default authSlice.reducer
export const selectCurrentToken = (state: RootState) => state.auth.token
