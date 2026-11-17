import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { createAppAsyncThunk } from '../../withTypes'
import { authFetch } from '../../api/authFetch'

type Status = 'idle' | 'pending' | 'succeeded' | 'failed'

export interface Account {
  id: number
  email: string
  name: string
  active: boolean
  // not stored yet; the avatar shows the initials when it is missing
  avatarUrl?: string | null
}

export type AccountUpdate = Pick<Account, 'name' | 'email'>

export interface PasswordChange {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface AccountState {
  profile: Account | null
  status: Status
  error: string | null
}

// the API answers with { message } on errors and { message, errors } on validation
interface ErrorBody {
  message?: string
  errors?: { path: string }[]
}

const toError = (result: ErrorBody | null, fallback: string) => {
  if (Array.isArray(result?.errors) && result.errors.length) {
    const fields = result.errors.map((e) => e.path).join(', ')
    return new Error(`${result.message}: ${fields}`)
  }
  return new Error(result?.message ?? fallback)
}

export const fetchAccount = createAppAsyncThunk(
  'account/fetchAccount',
  async (_, thunkApi) => {
    const response = await authFetch(thunkApi, `/account`)
    const result = await response.json()
    if (!response.ok) {
      throw toError(result, 'Could not load your account.')
    }
    return result.data as Account
  },
  {
    condition(_, thunkApi) {
      return thunkApi.getState().account.status === 'idle'
    },
  }
)

export const updateAccount = createAppAsyncThunk(
  'account/updateAccount',
  async (changes: AccountUpdate, thunkApi) => {
    const response = await authFetch(thunkApi, `/account`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await response.json()
    if (!response.ok) {
      throw toError(result, 'Could not save your changes.')
    }
    return result.data as Account
  }
)

export const changePassword = createAppAsyncThunk(
  'account/changePassword',
  async (passwords: PasswordChange, thunkApi) => {
    const response = await authFetch(thunkApi, `/account/password`, {
      method: 'PATCH',
      body: JSON.stringify(passwords),
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await response.json()
    if (!response.ok) {
      throw toError(result, 'Could not change your password.')
    }
    return result.message as string
  }
)

const initialState: AccountState = {
  profile: null,
  status: 'idle',
  error: null,
}

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccount.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.profile = action.payload
      })
      .addCase(fetchAccount.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unknown Error'
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.profile = action.payload
      })
  },
})

export default accountSlice.reducer
export const selectAccount = (state: RootState) => state.account.profile
export const selectAccountStatus = (state: RootState) => state.account.status
export const selectAccountError = (state: RootState) => state.account.error
