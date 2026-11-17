import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { createAppAsyncThunk } from '../../withTypes'
import { authFetch } from '../../api/authFetch'

type Status = 'idle' | 'pending' | 'succeeded' | 'failed'

export interface DashboardBingo {
  id: number
  title: string
  gridSize: number
  raffleDate: string | null
  isDone: boolean | null
  taken: number
  lastUpdated: string | null
}

export interface RecentSpot {
  bingoId: number
  bingoTitle: string
  cellNumber: number
  participantName: string | null
  takenAt: string
}

interface DashboardData {
  bingos: DashboardBingo[]
  recent: RecentSpot[]
}

interface DashboardState extends DashboardData {
  status: Status
  error: string | null
}

// no `condition` guard: the dashboard is refreshed every time it is opened
export const fetchDashboard = createAppAsyncThunk(
  'dashboard/fetchDashboard',
  async (_, thunkApi) => {
    const response = await authFetch(thunkApi, `/bingos/summary`)
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result?.message ?? 'Could not load the dashboard.')
    }
    return result.data as DashboardData
  }
)

const initialState: DashboardState = {
  bingos: [],
  recent: [],
  status: 'idle',
  error: null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = 'pending'
        state.error = null
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.bingos = action.payload.bingos
        state.recent = action.payload.recent
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unknown Error'
      })
  },
})

export default dashboardSlice.reducer
export const selectDashboardBingos = (state: RootState) =>
  state.dashboard.bingos
export const selectDashboardRecent = (state: RootState) =>
  state.dashboard.recent
export const selectDashboardStatus = (state: RootState) =>
  state.dashboard.status
export const selectDashboardError = (state: RootState) => state.dashboard.error
