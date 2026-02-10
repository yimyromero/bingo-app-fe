import { configureStore, type Action } from '@reduxjs/toolkit'
import bingosReducer from './features/bingos/bingosApiSlice'

export const store = configureStore({
  reducer: {
    bingos: bingosReducer,
  },
})

export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
