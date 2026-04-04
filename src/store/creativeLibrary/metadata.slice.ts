import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import type { FileMetadata } from '../../lib/types/models'
import { replaceFile } from './files.slice'
import type { CreativeFileWithMetadata } from '@/lib/types'
import type { VersioningLifecycleState } from '@/lib/versioning'
import { trackVersioningLifecycle, upsertVersioningState } from './versioning.slice'

interface MetadataMutationResponse {
  file: CreativeFileWithMetadata
  versioning?: VersioningLifecycleState
}

function normalizeMetadataMutationResponse(
  data: CreativeFileWithMetadata | MetadataMutationResponse,
): MetadataMutationResponse {
  if ('file' in data) {
    return data
  }

  return { file: data }
}

export interface MetadataState {
  saving: boolean
  error: string | null
}

const initialState: MetadataState = {
  saving: false,
  error: null,
}

export const updateMetadata = createAsyncThunk(
  'metadata/updateMetadata',
  async ({ fileId, metadata }: { fileId: string; metadata: Partial<FileMetadata> }, { dispatch }) => {
    const response = await fetch(`/api/files/${fileId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update metadata')
    }

    const normalized = normalizeMetadataMutationResponse(await response.json())
    dispatch(replaceFile(normalized.file))

    if (normalized.versioning) {
      dispatch(upsertVersioningState(normalized.versioning))
      void dispatch(trackVersioningLifecycle(fileId))
    }

    return normalized.file
  },
)

const metadataSlice = createSlice({
  name: 'metadata',
  initialState,
  reducers: {
    clearMetadataError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateMetadata.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(updateMetadata.fulfilled, (state) => {
        state.saving = false
      })
      .addCase(updateMetadata.rejected, (state, action) => {
        state.saving = false
        state.error = action.error.message || 'Failed to update metadata'
      })
  },
})

export const { clearMetadataError } = metadataSlice.actions
export default metadataSlice.reducer
