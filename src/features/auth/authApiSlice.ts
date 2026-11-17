import { createSlice } from '@reduxjs/toolkit'
import { createAppAsyncThunk } from '../../withTypes'
import type { User } from '../users/usersApiSlice'
import type { RootState } from '../../store'

import { baseUrl } from '../../api/baseUrl'

type Status = 'idle' | 'pending' | 'succeeded' | 'failed'

interface TokenState {
  token: string | null
  refreshing: boolean
  sessionChecked: boolean
  status: Status
  error: string | null
}

type Login = Pick<User, 'email' | 'passwordHash'> & {
  rememberMe?: boolean
}

export const login = createAppAsyncThunk(
  'auth/login',
  async ({ email, passwordHash: password, rememberMe }: Login) => {
    const response = await fetch(`${baseUrl}/auth`, {
      method: 'POST',
      // credentials so the browser stores the refresh cookie
      credentials: 'include',
      body: JSON.stringify({ email, password, rememberMe }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (!response.ok) {
      // the status code lets the form pick the right message
      throw new Error(`HTTP ${response.status}`)
    }

    return result
  }
)

// Ask the server for a new access token using the httpOnly refresh cookie
export const refreshSession = createAppAsyncThunk(
  'auth/refreshSession',
  async () => {
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Response status: ${response.statusText}`)
    }

    return (await response.json()) as { accessToken: string }
  },
  {
    condition(_, thunkApi) {
      return !thunkApi.getState().auth.refreshing
    },
  }
)

// Set a new password using the token from the reset email
export const resetPassword = createAppAsyncThunk(
  'auth/resetPassword',
  async (body: {
    token: string
    newPassword: string
    confirmPassword: string
  }) => {
    const response = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result?.message ?? 'Could not reset your password.')
    }
    return result.message as string
  }
)

export const logout = createAppAsyncThunk('auth/logout', async () => {
  const response = await fetch(`${baseUrl}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Response status: ${response.statusText}`)
  }

  return true
})

const initialState: TokenState = {
  token: null,
  refreshing: false,
  sessionChecked: false,
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state, action) => {
        state.status = 'pending'
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.token = action.payload.accessToken
        state.sessionChecked = true
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.error.message ?? 'Unknown Error'
      })
      .addCase(refreshSession.pending, (state) => {
        state.refreshing = true
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.refreshing = false
        state.sessionChecked = true
        state.token = action.payload.accessToken
      })
      .addCase(refreshSession.rejected, (state) => {
        // no valid refresh cookie: the session is over
        state.refreshing = false
        state.sessionChecked = true
        state.token = null
      })
  },
})

export default authSlice.reducer
export const selectCurrentToken = (state: RootState) => state.auth.token
export const selectSessionChecked = (state: RootState) =>
  state.auth.sessionChecked
