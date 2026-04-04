import { configureStore, isPlain } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import { apiSlice } from './api'
import filesReducer from './creativeLibrary/files.slice'
import metadataReducer from './creativeLibrary/metadata.slice'
import versioningReducer from './creativeLibrary/versioning.slice'
import projectsReducer from './projects/projects.slice'

const isReduxSerializable = (value: unknown): boolean => {
  if (value == null) {
    return true
  }

  if (typeof value === 'bigint') {
    return true
  }

  if (value instanceof Date) {
    return true
  }

  if (Array.isArray(value)) {
    return true
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return true
  }

  return isPlain(value)
}

/**
 * Redux Store Configuration
 * Configured with Redux Toolkit for modern Redux development
 */

export const createAppStore = () =>
  configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      files: filesReducer,
      metadata: metadataReducer,
      versioning: versioningReducer,
      projects: projectsReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          isSerializable: isReduxSerializable,
          ignoredActionPaths: ['meta.arg'],
        },
      }).concat(apiSlice.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  })

export const store = createAppStore()

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Export pre-typed hooks for usage in components
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
