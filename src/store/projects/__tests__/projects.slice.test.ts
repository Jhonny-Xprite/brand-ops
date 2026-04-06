import projectsReducer, {
  ProjectsState,
  Project,
  fetchProjects,
  createProject,
  clearProjectContext,
  setSyncStatus,
  setActiveProjectId,
  upsertProject,
} from '../projects.slice'
import { configureStore } from '@reduxjs/toolkit'

global.fetch = jest.fn()

describe('projects.slice', () => {
  const mockProject: Project = {
    id: 'proj-1',
    name: 'Test Project',
    niche: 'technology',
    businessModel: 'ECOMMERCE',
    logoUrl: 'https://example.com/logo.png',
    assetCount: 10,
    createdAt: '2026-04-01T10:00:00Z',
    socialLinks: {
      instagramUrl: 'https://instagram.com/test',
    },
  }

  const mockProject2: Project = {
    id: 'proj-2',
    name: 'Another Project',
    niche: 'finance',
    businessModel: 'NEGOCIO_LOCAL',
    assetCount: 5,
    createdAt: '2026-04-02T10:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = projectsReducer(undefined, { type: 'unknown' })

      expect(state).toEqual({
        items: [],
        loading: false,
        error: null,
        syncStatus: 'synced',
        syncError: null,
        activeProjectId: null,
      })
    })
  })

  describe('reducers', () => {
    let initialState: ProjectsState

    beforeEach(() => {
      initialState = {
        items: [mockProject],
        loading: false,
        error: null,
        syncStatus: 'synced',
        syncError: null,
        activeProjectId: null,
      }
    })

    describe('setSyncStatus', () => {
      it('should set sync status to syncing', () => {
        const state = projectsReducer(
          initialState,
          setSyncStatus({ status: 'syncing' })
        )

        expect(state.syncStatus).toBe('syncing')
        expect(state.syncError).toBeNull()
      })

      it('should set sync status to failed with error', () => {
        const state = projectsReducer(
          initialState,
          setSyncStatus({ status: 'failed', error: 'Sync failed' })
        )

        expect(state.syncStatus).toBe('failed')
        expect(state.syncError).toBe('Sync failed')
      })

      it('should set sync status to synced', () => {
        const stateWithError: ProjectsState = {
          ...initialState,
          syncStatus: 'failed',
          syncError: 'Previous error',
        }

        const state = projectsReducer(
          stateWithError,
          setSyncStatus({ status: 'synced' })
        )

        expect(state.syncStatus).toBe('synced')
        expect(state.syncError).toBeNull()
      })
    })

    describe('setActiveProjectId', () => {
      it('should set active project ID', () => {
        const state = projectsReducer(
          initialState,
          setActiveProjectId('proj-1')
        )

        expect(state.activeProjectId).toBe('proj-1')
      })

      it('should clear active project ID', () => {
        const state = projectsReducer(
          { ...initialState, activeProjectId: 'proj-1' },
          setActiveProjectId(null)
        )

        expect(state.activeProjectId).toBeNull()
      })
    })

    describe('upsertProject', () => {
      it('should add new project to beginning of items', () => {
        const state = projectsReducer(initialState, upsertProject(mockProject2))

        expect(state.items[0]).toEqual(mockProject2)
        expect(state.items[1]).toEqual(mockProject)
        expect(state.items.length).toBe(2)
      })

      it('should update existing project', () => {
        const updatedProject: Project = {
          ...mockProject,
          name: 'Updated Project',
        }

        const state = projectsReducer(
          initialState,
          upsertProject(updatedProject)
        )

        expect(state.items[0]).toEqual(updatedProject)
        expect(state.items.length).toBe(1)
      })

      it('should merge social links when updating', () => {
        const projectWithPartialSocial: Project = {
          ...mockProject,
          socialLinks: {
            youtubeUrl: 'https://youtube.com/test',
          },
        }

        const state = projectsReducer(
          initialState,
          upsertProject(projectWithPartialSocial)
        )

        expect(state.items[0].socialLinks).toEqual({
          instagramUrl: 'https://instagram.com/test',
          youtubeUrl: 'https://youtube.com/test',
        })
      })

      it('should handle adding to empty items', () => {
        const emptyState: ProjectsState = {
          items: [],
          loading: false,
          error: null,
          syncStatus: 'synced',
          syncError: null,
          activeProjectId: null,
        }

        const state = projectsReducer(emptyState, upsertProject(mockProject))

        expect(state.items).toEqual([mockProject])
      })
    })
  })

  describe('async thunks', () => {
    describe('fetchProjects', () => {
      it('should handle successful fetch', async () => {
        const mockResponse = [mockProject, mockProject2]
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        const store = configureStore({
          reducer: { projects: projectsReducer },
        })

        await store.dispatch(fetchProjects())
        const state = store.getState().projects

        expect(state.loading).toBe(false)
        expect(state.items).toEqual(mockResponse)
        expect(state.error).toBeNull()
        expect(state.syncStatus).toBe('synced')
      })

      it('should handle fetch error', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
        })

        const store = configureStore({
          reducer: { projects: projectsReducer },
        })

        await store.dispatch(fetchProjects())
        const state = store.getState().projects

        expect(state.loading).toBe(false)
        expect(state.error).toBeDefined()
        expect(state.syncStatus).toBe('failed')
        expect(state.items).toEqual([])
      })

      it('should set loading to true during fetch', () => {
        ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
          new Promise(() => {})
        )

        const store = configureStore({
          reducer: { projects: projectsReducer },
        })

        store.dispatch(fetchProjects())
        const state = store.getState().projects

        expect(state.loading).toBe(true)
        expect(state.error).toBeNull()
      })

      it('should call correct API endpoint', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        })

        const store = configureStore({
          reducer: { projects: projectsReducer },
        })

        await store.dispatch(fetchProjects())

        expect(global.fetch).toHaveBeenCalledWith('/api/projects')
      })
    })

    describe('createProject', () => {
      it('should handle successful project creation', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockProject,
        })

        const store = configureStore({
          reducer: { projects: projectsReducer },
        })

        await store.dispatch(
          createProject({
            projectName: 'Test Project',
            niche: 'technology',
            businessModel: 'ECOMMERCE',
          })
        )

        const state = store.getState().projects

        expect(state.loading).toBe(false)
        expect(state.items[0]).toEqual(mockProject)
        expect(state.error).toBeNull()
        expect(state.syncStatus).toBe('synced')
      })

      it('should handle creation error', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Project name already exists' }),
        })

        const store = configureStore({
          reducer: { projects: projectsReducer },
        })

        await store.dispatch(
          createProject({
            projectName: 'Test',
            niche: 'tech',
            businessModel: 'ECOMMERCE',
          })
        )

        const state = store.getState().projects

        expect(state.loading).toBe(false)
        expect(state.error).toBeDefined()
        expect(state.syncStatus).toBe('failed')
      })

      it('should include file in form data if provided', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockProject,
        })

        const store = configureStore({
          reducer: { projects: projectsReducer },
        })

        const file = new File(['logo'], 'logo.png', { type: 'image/png' })

        await store.dispatch(
          createProject({
            projectName: 'Test',
            niche: 'tech',
            businessModel: 'ECOMMERCE',
            logoFile: file,
          })
        )

        const call = (global.fetch as jest.Mock).mock.calls[0]
        const formData = call[1].body as FormData
        expect(formData.get('logoFile')).toEqual(file)
      })

      it('should not include file if not provided', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockProject,
        })

        const store = configureStore({
          reducer: { projects: projectsReducer },
        })

        await store.dispatch(
          createProject({
            projectName: 'Test',
            niche: 'tech',
            businessModel: 'ECOMMERCE',
          })
        )

        const call = (global.fetch as jest.Mock).mock.calls[0]
        const formData = call[1].body as FormData
        expect(formData.get('logoFile')).toBeNull()
      })

      it('should set loading to true during creation', () => {
        ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
          new Promise(() => {})
        )

        const store = configureStore({
          reducer: { projects: projectsReducer },
        })

        store.dispatch(
          createProject({
            projectName: 'Test',
            niche: 'tech',
            businessModel: 'ECOMMERCE',
          })
        )

        const state = store.getState().projects
        expect(state.loading).toBe(true)
      })
    })

    describe('clearProjectContext', () => {
      it('should clear active project ID on success', async () => {
        const store = configureStore({
          reducer: { projects: projectsReducer },
        })

        await store.dispatch(clearProjectContext())
        const state = store.getState().projects

        expect(state.activeProjectId).toBeNull()
      })
    })
  })

  describe('integration', () => {
    it('should handle fetch, upsert, and set active', () => {
      let state = projectsReducer(undefined, { type: 'unknown' })

      // Fetch projects
      state = projectsReducer(state, fetchProjects.fulfilled([mockProject], ''))
      expect(state.items).toEqual([mockProject])
      expect(state.syncStatus).toBe('synced')

      // Upsert new project
      state = projectsReducer(state, upsertProject(mockProject2))
      expect(state.items.length).toBe(2)
      expect(state.items[0]).toEqual(mockProject2)

      // Set active
      state = projectsReducer(state, setActiveProjectId('proj-2'))
      expect(state.activeProjectId).toBe('proj-2')
    })

    it('should handle sync status transitions', () => {
      let state = projectsReducer(undefined, { type: 'unknown' })
      expect(state.syncStatus).toBe('synced')

      // Start syncing
      state = projectsReducer(
        state,
        setSyncStatus({ status: 'syncing' })
      )
      expect(state.syncStatus).toBe('syncing')

      // Sync failed
      state = projectsReducer(
        state,
        setSyncStatus({ status: 'failed', error: 'Network error' })
      )
      expect(state.syncStatus).toBe('failed')
      expect(state.syncError).toBe('Network error')

      // Sync succeeded
      state = projectsReducer(
        state,
        setSyncStatus({ status: 'synced' })
      )
      expect(state.syncStatus).toBe('synced')
      expect(state.syncError).toBeNull()
    })
  })
})
