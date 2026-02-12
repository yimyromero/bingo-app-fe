import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { createAppAsyncThunk } from '../../withTypes'

export interface Bingo {
  id: number
  userId: number
  title: string
  gridSize: number
  raffleDate?: string
  isDone?: boolean
  createdAt: string
}

type BingoUpdated = Pick<
  Bingo,
  'id' | 'title' | 'gridSize' | 'raffleDate' | 'isDone'
>
type NewBingo = Pick<Bingo, 'title' | 'gridSize' | 'userId'>

interface BingosState {
  bingos: Bingo[]
  status: 'idle' | 'pending' | 'succeeded' | 'rejected'
  error: string | null
}

export const fetchBingos = createAppAsyncThunk(
  'bingos/fetchBingos',
  async () => {
    const response = await fetch('http://localhost:3000/bingos', {
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
      const bingosStatus = selectBingoStatus(thunkApi.getState())
      if (bingosStatus !== 'idle') {
        return false
      }
    },
  }
)

const initialState: BingosState = {
  bingos: [],
  status: 'idle',
  error: null,
}

const bingosSlice = createSlice({
  name: 'bingos',
  initialState,
  reducers: {
    bingoUpdated(state, action: PayloadAction<BingoUpdated>) {
      const { id, title, gridSize } = action.payload
      const existingBingo = state.bingos.find((bingo) => bingo.id === id)
      if (existingBingo) {
        existingBingo.title = title
        existingBingo.gridSize = gridSize
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBingos.pending, (state, action) => {
        state.status = 'pending'
      })
      .addCase(fetchBingos.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.bingos = action.payload
      })
      .addCase(fetchBingos.rejected, (state, action) => {
        state.status = 'rejected'
        state.error = action.error.message ?? 'Unknown Error'
      })
  },
})

export const { bingoUpdated } = bingosSlice.actions
export default bingosSlice.reducer
export const selectAllBingos = (state: RootState) => state.bingos.bingos
export const selectBingosById = (state: RootState, bingoId: number) =>
  state.bingos.bingos.find((bingo) => bingo.id === bingoId)
export const selectBingoStatus = (state: RootState) => state.bingos.status
export const selectBingosError = (state: RootState) => state.bingos.error
