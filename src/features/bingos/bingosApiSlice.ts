import {
  createSlice,
  type PayloadAction,
  createEntityAdapter,
  type EntityState,
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
export const fetchBingoDetails = createAppAsyncThunk(
  'bingos/getBingoDetails',
  async (bingoId: number) => {
    const response = await fetch(
      `http://localhost:3000/bingos/${bingoId}/details`,
      {
        method: 'GET',
      }
    )

    const result = await response.json()
    console.log(result, 'json')
    console.log(response.status, response.ok, 'res')
    if (!response.ok) {
      throw new Error(`Response status: ${response.statusText}`)
    }

    return result
  },
  {
    // runs at the start of the thunk call
    condition(bingoId, thunkApi) {
      const state = thunkApi.getState()
      const { currentBingoId, detailStatus } = state.bingos

      if (detailStatus === 'pending' || currentBingoId === bingoId) {
        return false
      }
      return true
    },
  }
)

const initialState = {
  bingos: bingosAdapter.getInitialState(),
  details: detailsAdapter.getInitialState(),
  currentBingoId: null as number | null,
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
      .addCase(addNewBingo.fulfilled, (state, action) => {
        bingosAdapter.upsertOne(state.bingos, action.payload)
      })
      .addCase(addNewBingo.rejected, (state, action) => {
        state.error = action.error.message ?? 'Unknow Error'
      })
      .addCase(fetchBingoDetails.pending, (state, action) => {
        state.detailStatus = 'pending'
        detailsAdapter.removeAll(state.details)
      })
      .addCase(fetchBingoDetails.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.currentBingoId = action.meta.arg
        detailsAdapter.setAll(state.details, action.payload)
      })
      .addCase(fetchBingoDetails.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.error = action.error.message ?? 'Unknown Error'
      })
  },
})

export default bingosSlice.reducer
const selectBingosState = (state: RootState) => state.bingos.bingos
const selectDetailsState = (state: RootState) => state.bingos.details

export const {
  selectAll: selectAllBingos,
  selectById: selectBingosById,
  selectIds: selectBingosIds,
} = bingosAdapter.getSelectors(selectBingosState)

export const {
  selectAll: selectAllDetails,
  selectById: selectDetailsById,
  selectIds: selectDetailsIds,
} = detailsAdapter.getSelectors(selectDetailsState)

export const selectBingoStatus = (state: RootState) => state.bingos.listStatus
export const selectBingosError = (state: RootState) => state.bingos.error

export const selectCurrentBingoId = (state: RootState) =>
  state.bingos.currentBingoId

export const selectDetailsStatus = (state: RootState) =>
  state.bingos.detailStatus
export const selectDetailsError = (state: RootState) => state.bingos.error
