import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseEnvUrl = import.meta.env.VITE_API_BASE_URL
export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: baseEnvUrl }),
  endpoints: (builder) => ({}),
})
