import {
  createSlice,
  type PayloadAction,
  createEntityAdapter,
  type EntityState,
  createSelector,
} from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { createAppAsyncThunk } from '../../withTypes'
import { authFetch } from '../../api/authFetch'

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
  takenAt?: string | null
  updatedAt?: string
}

type BingoUpdated = Pick<
  Bingo,
  'id' | 'userId' | 'title' | 'gridSize' | 'raffleDate' | 'isDone'
>
type NewBingo = Pick<Bingo, 'userId' | 'title' | 'gridSize'>

type BingoDetailUpdate = Pick<BingoDetail, 'id' | 'bingoId' | 'participantName'>

const bingosAdapter = createEntityAdapter<Bingo>({
  sortComparer: (a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
})

const detailsAdapter = createEntityAdapter<BingoDetail>({
  sortComparer: (a, b) => a.cellNumber - b.cellNumber,
})

export type BingoSortField = 'createdAt' | 'title' | 'raffleDate' | 'gridSize'
export interface BingoListParams {
  page: number // zero based
  pageSize: number
  search: string
  status: 'all' | 'active' | 'finished'
  raffleFrom: string // YYYY-MM-DD or ''
  raffleTo: string
  sort: BingoSortField
  order: 'asc' | 'desc'
}

// One page of the list; filtering, ordering and paging happen on the server
export const fetchBingoPage = createAppAsyncThunk(
  'bingos/fetchBingoPage',
  async (params: BingoListParams, thunkApi) => {
    const query = new URLSearchParams({
      offset: String(params.page * params.pageSize),
      limit: String(params.pageSize),
      status: params.status,
      sort: params.sort,
      order: params.order,
    })
    if (params.search.trim()) query.set('search', params.search.trim())
    if (params.raffleFrom) query.set('raffleFrom', params.raffleFrom)
    if (params.raffleTo) query.set('raffleTo', params.raffleTo)

    const response = await authFetch(thunkApi, `/bingos?${query}`, {
      method: 'GET',
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(
        result?.message ?? `Response status: ${response.statusText}`
      )
    }
    return {
      bingos: result.data as Bingo[],
      total: result.meta.total as number,
    }
  }
)

export const deleteBingo = createAppAsyncThunk(
  'bingos/deleteBingo',
  async (bingoId: number, thunkApi) => {
    const response = await authFetch(thunkApi, `/bingos/${bingoId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const result = await response.json().catch(() => null)
      throw new Error(
        result?.message ?? `Response status: ${response.statusText}`
      )
    }
    return bingoId
  }
)

// a bingo may not be in the (paginated) list, so load it directly
export const fetchBingoById = createAppAsyncThunk(
  'bingos/fetchBingoById',
  async (bingoId: number, thunkApi) => {
    const response = await authFetch(thunkApi, `/bingos/${bingoId}`, {
      method: 'GET',
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(
        result?.message ?? `Response status: ${response.statusText}`
      )
    }
    return result.data
  }
)

export const addNewBingo = createAppAsyncThunk(
  'bingos/addNewBingo',
  async (initialBingo: NewBingo, thunkApi) => {
    const response = await authFetch(thunkApi, `/bingos`, {
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

export const updateBingo = createAppAsyncThunk(
  'bingos/updateBingo',
  async (bingo: BingoUpdated, thunkApi) => {
    const response = await authFetch(thunkApi, `/bingos`, {
      method: 'PATCH',
      body: JSON.stringify(bingo),
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
  async (bingoId: number, thunkApi) => {
    const response = await authFetch(thunkApi, `/bingos/${bingoId}/details`, {
      method: 'GET',
    })

    const result = await response.json()

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

// Re-read the bingo and its cells from the API (used before sharing an update)
export const refreshBingoSnapshot = createAppAsyncThunk(
  'bingos/refreshBingoSnapshot',
  async (bingoId: number, thunkApi) => {
    const [bingosResponse, detailsResponse] = await Promise.all([
      authFetch(thunkApi, `/bingos/${bingoId}`),
      authFetch(thunkApi, `/bingos/${bingoId}/details`),
    ])

    if (!bingosResponse.ok || !detailsResponse.ok) {
      throw new Error('Could not load the latest bingo data.')
    }

    const bingos = [(await bingosResponse.json()).data as Bingo]
    const details = (await detailsResponse.json()) as BingoDetail[]

    return { bingoId, bingos, details }
  }
)

export const updateBingoCell = createAppAsyncThunk(
  'bingos/updateBingoCell',
  async (
    { id: detailId, bingoId, participantName }: BingoDetailUpdate,
    thunkApi
  ) => {
    const response = await authFetch(
      thunkApi,
      `/bingos/${bingoId}/details/${detailId}/cell`,
      {
        method: 'POST',
        body: JSON.stringify({ participantName }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Response status: ${response.statusText}`)
    }

    return result
  }
)

const initialState = {
  bingos: bingosAdapter.getInitialState(),
  details: detailsAdapter.getInitialState(),
  currentBingoId: null as number | null,
  list: {
    ids: [] as number[],
    total: 0,
    status: 'idle' as Status,
    error: null as string | null,
    requestId: null as string | null,
  },
  detailStatus: 'idle' as Status,
  error: null as string | null,
}

const bingosSlice = createSlice({
  name: 'bingos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBingoPage.pending, (state, action) => {
        state.list.status = 'pending'
        state.list.requestId = action.meta.requestId
      })
      .addCase(fetchBingoPage.fulfilled, (state, action) => {
        // ignore answers to requests that were already replaced by a newer one
        if (state.list.requestId !== action.meta.requestId) return
        state.list.status = 'succeeded'
        state.list.error = null
        state.list.total = action.payload.total
        const incoming = action.payload.bingos.map((b) => b.id)
        // later pages ("load more") are added to the ones already shown
        state.list.ids =
          action.meta.arg.page > 0
            ? [
                ...state.list.ids,
                ...incoming.filter((id) => !state.list.ids.includes(id)),
              ]
            : incoming
        bingosAdapter.upsertMany(state.bingos, action.payload.bingos)
      })
      .addCase(fetchBingoPage.rejected, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return
        state.list.status = 'failed'
        state.list.error = action.error.message ?? 'Unknown Error'
      })
      .addCase(deleteBingo.fulfilled, (state, action) => {
        bingosAdapter.removeOne(state.bingos, action.payload)
        if (state.list.ids.includes(action.payload)) {
          state.list.ids = state.list.ids.filter((id) => id !== action.payload)
          state.list.total = Math.max(0, state.list.total - 1)
        }
      })
      .addCase(fetchBingoById.fulfilled, (state, action) => {
        bingosAdapter.upsertOne(state.bingos, action.payload)
      })
      .addCase(addNewBingo.fulfilled, (state, action) => {
        bingosAdapter.upsertOne(state.bingos, action.payload)
      })
      .addCase(addNewBingo.rejected, (state, action) => {
        state.error = action.error.message ?? 'Unknow Error'
      })
      .addCase(updateBingo.fulfilled, (state, action) => {
        bingosAdapter.upsertOne(state.bingos, action.payload)
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
        state.currentBingoId = action.meta.arg
        state.error = action.error.message ?? 'Unknown Error'
      })
      .addCase(refreshBingoSnapshot.fulfilled, (state, action) => {
        const { bingoId, bingos, details } = action.payload
        bingosAdapter.upsertMany(state.bingos, bingos)
        detailsAdapter.setAll(state.details, details)
        state.currentBingoId = bingoId
        state.detailStatus = 'succeeded'
      })
      .addCase(updateBingoCell.fulfilled, (state, action) => {
        console.log(action.payload)
        detailsAdapter.updateOne(state.details, {
          id: Number(action.payload.id),
          changes: action.payload,
        })
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

export const selectTakenCount = createSelector(
  selectAllDetails,
  (details) => details.filter((detail) => detail.participantName?.trim()).length
)

export const selectBingoStatus = (state: RootState) => state.bingos.list.status
export const selectBingosError = (state: RootState) => state.bingos.list.error
export const selectBingoTotal = (state: RootState) => state.bingos.list.total
const selectListIds = (state: RootState) => state.bingos.list.ids
// the current page, in the order the server returned it
export const selectBingoPage = createSelector(
  [selectListIds, selectBingosState],
  (ids, bingos) =>
    ids.map((id) => bingos.entities[id]).filter((b): b is Bingo => !!b)
)

export const selectCurrentBingoId = (state: RootState) =>
  state.bingos.currentBingoId

export const selectDetailsStatus = (state: RootState) =>
  state.bingos.detailStatus
export const selectDetailsError = (state: RootState) => state.bingos.error
