import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { VersioningLifecycleState } from '@/lib/versioning'

export interface VersioningState {
  byFileId: Record<string, VersioningLifecycleState>
  loading: boolean
  error: string | null
}

const initialState: VersioningState = {
  byFileId: {},
  loading: false,
  error: null,
}

export const fetchVersioningStatus = createAsyncThunk(
  'versioning/fetchStatus',
  async (fileId?: string): Promise<VersioningLifecycleState | VersioningLifecycleState[]> => {
    const url = fileId ? `/api/versioning/status?fileId=${encodeURIComponent(fileId)}` : '/api/versioning/status'
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Failed to load versioning status')
    }

    const data = await response.json()
    return fileId ? data.state : data.states
  },
)

export const trackVersioningLifecycle = createAsyncThunk(
  'versioning/trackLifecycle',
  async (fileId: string, { dispatch }) => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const result = await dispatch(fetchVersioningStatus(fileId)).unwrap()
      const state = Array.isArray(result) ? result[0] : result

      if (!state || state.state === 'idle' || state.state === 'complete' || state.state === 'failed') {
        return state ?? null
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    return null
  },
)

const versioningSlice = createSlice({
  name: 'versioning',
  initialState,
  reducers: {
    upsertVersioningState: (state, action: PayloadAction<VersioningLifecycleState>) => {
      state.byFileId[action.payload.fileId] = action.payload
    },
    clearVersioningError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVersioningStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVersioningStatus.fulfilled, (state, action) => {
        state.loading = false

        if (Array.isArray(action.payload)) {
          for (const item of action.payload) {
            state.byFileId[item.fileId] = item
          }
          return
        }

        state.byFileId[action.payload.fileId] = action.payload
      })
      .addCase(fetchVersioningStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Failed to load versioning status'
      })
  },
})

export const { upsertVersioningState, clearVersioningError } = versioningSlice.actions
export default versioningSlice.reducer
