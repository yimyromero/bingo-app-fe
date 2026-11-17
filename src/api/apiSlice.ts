import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { baseUrl as baseEnvUrl } from './baseUrl'
export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: baseEnvUrl }),
  endpoints: (builder) => ({}),
})
