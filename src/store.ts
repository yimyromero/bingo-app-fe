import { configureStore, type Action } from '@reduxjs/toolkit'
import bingosReducer from './features/bingos/bingosApiSlice'
import usersReducer from './features/users/usersApiSlice'
import authReducer from './features/auth/authApiSlice'
export const store = configureStore({
  reducer: {
    bingos: bingosReducer,
    users: usersReducer,
    auth: authReducer,
  },
})

export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
