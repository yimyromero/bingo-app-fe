import { refreshSession } from '../features/auth/authApiSlice'
import type { AppDispatch, RootState } from '../store'

import { baseUrl } from './baseUrl'

interface ThunkApiLike {
  getState: () => RootState
  dispatch: AppDispatch
}

// share one refresh request between calls that fail at the same time
let refreshing: Promise<string | null> | null = null

const refreshToken = (thunkApi: ThunkApiLike) => {
  if (!refreshing) {
    refreshing = thunkApi
      .dispatch(refreshSession())
      .unwrap()
      .then((result) => result.accessToken)
      .catch(() => null)
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

/**
 * fetch against the API with the current access token.
 * If the token was rejected, refresh the session once and retry.
 */
export const authFetch = async (
  thunkApi: ThunkApiLike,
  path: string,
  init: RequestInit = {}
) => {
  const send = (token: string | null) => {
    const headers = new Headers(init.headers)
    headers.set('authorization', `Bearer ${token}`)
    return fetch(`${baseUrl}${path}`, { ...init, headers })
  }

  let response = await send(thunkApi.getState().auth.token)

  if (response.status === 401 || response.status === 403) {
    const newToken = await refreshToken(thunkApi)
    if (newToken) {
      response = await send(newToken)
    }
  }

  return response
}
