import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface Project {
  id: string
  name: string
  logoUrl?: string
  assetCount: number
  createdAt: string
}

export interface ProjectsState {
  items: Project[]
  loading: boolean
  error: string | null
  syncStatus: 'synced' | 'syncing' | 'failed'
  syncError: string | null
}

const initialState: ProjectsState = {
  items: [],
  loading: false,
  error: null,
  syncStatus: 'synced',
  syncError: null,
}

/**
 * Async thunk to fetch all projects from API
 */
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/projects')
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      return (await response.json()) as Project[]
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return rejectWithValue(message)
    }
  }
)

/**
 * Async thunk to create a new project
 */
export const createProject = createAsyncThunk(
  'projects/createProject',
  async (
    {
      projectName,
      logoFile,
    }: {
      projectName: string
      logoFile: File
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData()
      formData.append('projectName', projectName)
      formData.append('logoFile', logoFile)

      const response = await fetch('/api/projects/create', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create project')
      }

      return (await response.json()) as Project
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return rejectWithValue(message)
    }
  }
)

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setSyncStatus: (
      state,
      action: PayloadAction<{
        status: 'synced' | 'syncing' | 'failed'
        error?: string | null
      }>
    ) => {
      state.syncStatus = action.payload.status
      state.syncError = action.payload.error || null
    },
  },
  extraReducers: (builder) => {
    // Fetch projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.syncStatus = 'synced'
        state.syncError = null
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.syncStatus = 'failed'
        state.syncError = action.payload as string
      })

    // Create project
    builder
      .addCase(createProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setSyncStatus } = projectsSlice.actions
export default projectsSlice.reducer
