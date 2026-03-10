import { configureStore, type Action } from '@reduxjs/toolkit'
import { combineReducers, type UnknownAction } from 'redux'
import bingosReducer from './features/bingos/bingosApiSlice'
import usersReducer from './features/users/usersApiSlice'
import authReducer, { logout } from './features/auth/authApiSlice'

const appReducer = combineReducers({
  bingos: bingosReducer,
  users: usersReducer,
  auth: authReducer,
})

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: UnknownAction
) => {
  if (action.type === 'auth/logout/fulfilled') {
    state = undefined
  }

  return appReducer(state, action)
}

export const store = configureStore({
  reducer: rootReducer,
})

export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
