import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CreativeFileWithMetadata } from '../../lib/types/models';
import type { VersioningLifecycleState } from '@/lib/versioning';
import { trackVersioningLifecycle, upsertVersioningState } from './versioning.slice';

interface FileMutationResponse {
  file: CreativeFileWithMetadata
  versioning?: VersioningLifecycleState
}

function normalizeFileMutationResponse(data: CreativeFileWithMetadata | FileMutationResponse): FileMutationResponse {
  if ('file' in data) {
    return data
  }

  return { file: data }
}

export interface FilesState {
  items: CreativeFileWithMetadata[];
  loading: boolean;
  error: string | null;
  uploading: boolean;
  selectedFileId: string | null;
}

export interface FilesQuery {
  projectId?: string
  scope?: string
}

export interface UploadFileRequest extends FilesQuery {
  file: File
}

const initialState: FilesState = {
  items: [],
  loading: false,
  error: null,
  uploading: false,
  selectedFileId: null,
};

export const fetchFiles = createAsyncThunk('files/fetchFiles', async (query?: FilesQuery) => {
  const searchParams = new URLSearchParams();

  if (query?.projectId) {
    searchParams.set('projectId', query.projectId)
  }

  if (query?.scope && query.scope !== 'all') {
    searchParams.set('scope', query.scope)
  }

  const response = await fetch(`/api/files${searchParams.size > 0 ? `?${searchParams.toString()}` : ''}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch files' }));
    throw new Error(errorData.error || 'Failed to fetch files');
  }
  const data = await response.json();
  return data as CreativeFileWithMetadata[];
});

export const uploadFile = createAsyncThunk('files/uploadFile', async ({ file, projectId, scope }: UploadFileRequest, { dispatch }) => {
  const formData = new FormData();
  formData.append('file', file);
  if (projectId) {
    formData.append('projectId', projectId)
  }
  if (scope && scope !== 'all') {
    formData.append('scope', scope)
  }

  const response = await fetch('/api/files/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Upload failed');
  }

  const normalized = normalizeFileMutationResponse(await response.json() as CreativeFileWithMetadata | FileMutationResponse);

  if (normalized.versioning) {
    dispatch(upsertVersioningState(normalized.versioning))
    void dispatch(trackVersioningLifecycle(normalized.file.id))
  }

  return normalized;
});

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    addFile: (state, action: PayloadAction<CreativeFileWithMetadata>) => {
      state.items.unshift(action.payload);
    },
    replaceFile: (state, action: PayloadAction<CreativeFileWithMetadata>) => {
      state.items = state.items.map((file) => (file.id === action.payload.id ? action.payload : file));
    },
    selectFile: (state, action: PayloadAction<string | null>) => {
      state.selectedFileId = action.payload;
    },
    clearFilesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch files';
      })
      .addCase(uploadFile.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploading = false;
        state.items.unshift(action.payload.file);
        state.selectedFileId = action.payload.file.id; // Auto-select after upload
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.error.message || 'Upload failed';
      });
  },
});

export const { addFile, replaceFile, selectFile, clearFilesError } = filesSlice.actions;
export default filesSlice.reducer;
