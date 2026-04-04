import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

/**
 * RTK Query API Configuration
 * Base API setup for all endpoints
 * Specific endpoints will be added as features are implemented
 */

const runtimeFetch: typeof fetch = (...args) => {
  if (typeof globalThis.fetch !== 'function') {
    throw new Error('Global fetch is not available in the current runtime.')
  }

  return globalThis.fetch(...args)
}

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  fetchFn: runtimeFetch,
  prepareHeaders: (headers) => {
    // Add auth headers if token exists (client-side only, SSR-safe)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          headers.set('authorization', `Bearer ${token}`)
        }
      } catch {
        // localStorage may be disabled in private browsing
      }
    }
    return headers
  },
})

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['CreativeFile', 'FileMetadata', 'FileVersion', 'SyncMetadata'],
  endpoints: () => ({
    // Placeholder endpoints - will be implemented in future stories
  }),
})

// No hooks exported yet - endpoints will be added as features are implemented

export default apiSlice
