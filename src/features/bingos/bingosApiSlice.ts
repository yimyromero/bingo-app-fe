import {
  createSlice,
  type PayloadAction,
  createEntityAdapter,
} from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { createAppAsyncThunk } from '../../withTypes'

type Status = 'idle' | 'pending' | 'succeeded' | 'failed'
export interface Bingo {
  id: number
  userId: number
  title: string
  gridSize: number
  raffleDate: string
  isDone?: boolean
  createdAt: string
}

export interface BingoDetail {
  id: number
  bingoId: number
  cellNumber: number
  participantName: string | null
}

type BingoUpdated = Pick<
  Bingo,
  'id' | 'title' | 'gridSize' | 'raffleDate' | 'isDone'
>
type NewBingo = Pick<Bingo, 'userId' | 'title' | 'gridSize'>

interface BingosState {
  bingos: {
    entities: Record<string, Bingo>
    ids: string[]
  }

  details: {
    entities: Record<string, BingoDetail>
    idsByBingoId: Record<string, string[]>
  }

  listStatus: Status
  detailsStatus: Status
  updateCellStatus: Status

  error: string | null
}

const bingosAdapter = createEntityAdapter<Bingo>({
  sortComparer: (a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
})

const detailsAdapter = createEntityAdapter<BingoDetail>()

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

export const addNewBingo = createAppAsyncThunk(
  'bingos/addNewBingo',
  async (initialBingo: NewBingo) => {
    const response = await fetch('http://localhost:3000/bingos', {
      method: 'POST',
      body: JSON.stringify(initialBingo),
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

// Get bingo details
export const getBingoDetails = createAppAsyncThunk(
  'bingos/getBingoDetails',
  async (bingoId: number) => {
    const response = await fetch(
      `http://localhost:3000/bingos/'${bingoId}/details`,
      {
        method: 'GET',
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Response status: ${response.statusText}`)
    }

    return result.data
  }
)

const initialState = {
  bingos: bingosAdapter.getInitialState(),
  details: detailsAdapter.getInitialState<{
    idsByBingoId: Record<number, string[]>
  }>({
    idsByBingoId: {},
  }),
  listStatus: 'idle' as Status,
  detailStatus: 'idle' as Status,
  error: null as string | null,
}

const bingosSlice = createSlice({
  name: 'bingos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBingos.pending, (state, action) => {
        state.listStatus = 'pending'
      })
      .addCase(fetchBingos.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        bingosAdapter.setAll(state.bingos, action.payload)
      })
      .addCase(fetchBingos.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.error = action.error.message ?? 'Unknown Error'
      })
      .addCase(getBingoDetails.pending, (state, action) => {
        state.detailStatus = 'pending'
      })
      .addCase(getBingoDetails.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        detailsAdapter.upsertMany(state.details, action.payload)
      })
  },
})

export default bingosSlice.reducer
const selectBingosState = (state: RootState) => state.bingos.bingos
export const bingoDetailsSelector = detailsAdapter.getSelectors()

export const {
  selectAll: selectAllBingos,
  selectById: selectBingosById,
  selectIds: selectBingosIds,
} = bingosAdapter.getSelectors(selectBingosState)

export const selectBingoStatus = (state: RootState) => state.bingos.listStatus

export const selectBingosError = (state: RootState) => state.bingos.error
