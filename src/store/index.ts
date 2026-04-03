import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { apiSlice } from './api'

/**
 * Redux Store Configuration
 * Configured with Redux Toolkit for modern Redux development
 */

export const store = configureStore({
  reducer: {
    // RTK Query API
    [apiSlice.reducerPath]: apiSlice.reducer,
    // Slices will be added here as they are created
    // Example: creatives: creativesSlice.reducer,
    // Example: metadata: metadataSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['your-action-type'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Export pre-typed hooks for usage in components
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
