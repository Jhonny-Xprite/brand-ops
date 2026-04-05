import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { ProjectBusinessModel, ProjectSocialLinks } from '@/lib/projectDomain'

export interface Project {
  id: string
  name: string
  niche: string
  businessModel: ProjectBusinessModel
  logoUrl?: string
  assetCount: number
  createdAt: string
  socialLinks?: ProjectSocialLinks
}

export interface ProjectsState {
  items: Project[]
  loading: boolean
  error: string | null
  syncStatus: 'synced' | 'syncing' | 'failed'
  syncError: string | null
  activeProjectId: string | null
}

const initialState: ProjectsState = {
  items: [],
  loading: false,
  error: null,
  syncStatus: 'synced',
  syncError: null,
  activeProjectId: null,
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
      niche,
      businessModel,
      logoFile,
    }: {
      projectName: string
      niche: string
      businessModel: ProjectBusinessModel
      logoFile?: File | null
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData()
      formData.append('projectName', projectName)
      formData.append('niche', niche)
      formData.append('businessModel', businessModel)
      if (logoFile) {
        formData.append('logoFile', logoFile)
      }

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

/**
 * Async thunk to clear project context
 */
export const clearProjectContext = createAsyncThunk(
  'projects/clearProjectContext',
  async (_, { rejectWithValue }) => {
    try {
      // Clear active project ID and reset state
      return null
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
    setActiveProjectId: (state, action: PayloadAction<string | null>) => {
      state.activeProjectId = action.payload
    },
    upsertProject: (state, action: PayloadAction<Project>) => {
      const existingIndex = state.items.findIndex((project) => project.id === action.payload.id)

      if (existingIndex >= 0) {
        state.items[existingIndex] = {
          ...state.items[existingIndex],
          ...action.payload,
          socialLinks: {
            ...state.items[existingIndex].socialLinks,
            ...action.payload.socialLinks,
          },
        }
        return
      }

      state.items.unshift(action.payload)
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
        state.syncStatus = 'synced'
        state.syncError = null
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.syncStatus = 'failed'
        state.syncError = action.payload as string
      })

    // Clear project context
    builder
      .addCase(clearProjectContext.fulfilled, (state) => {
        state.activeProjectId = null
      })
      .addCase(clearProjectContext.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { setSyncStatus, setActiveProjectId, upsertProject } = projectsSlice.actions
export default projectsSlice.reducer
