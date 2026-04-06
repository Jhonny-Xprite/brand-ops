import filesReducer, {
  FilesState,
  fetchFiles,
  uploadFile,
  addFile,
  replaceFile,
  selectFile,
  clearFilesError,
} from '../files.slice'
import { CreativeFileWithMetadata } from '@/lib/types/models'
import { configureStore } from '@reduxjs/toolkit'

// Mock fetch globally
global.fetch = jest.fn()

describe('files.slice', () => {
  const mockFile: CreativeFileWithMetadata = {
    id: 'file-1',
    filename: 'test.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    size: BigInt(1024),
    createdAt: new Date('2026-04-01'),
    updatedAt: new Date('2026-04-01'),
    metadata: {
      type: 'image',
      status: 'Draft',
      tags: ['test'],
      notes: 'test file',
    },
  }

  const mockFile2: CreativeFileWithMetadata = {
    id: 'file-2',
    filename: 'test2.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    size: BigInt(2048),
    createdAt: new Date('2026-04-02'),
    updatedAt: new Date('2026-04-02'),
    metadata: {
      type: 'image',
      status: 'Approved',
      tags: ['test'],
      notes: 'another test file',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = filesReducer(undefined, { type: 'unknown' })

      expect(state).toEqual({
        items: [],
        loading: false,
        error: null,
        uploading: false,
        selectedFileId: null,
      })
    })
  })

  describe('reducers', () => {
    let initialState: FilesState

    beforeEach(() => {
      initialState = {
        items: [mockFile],
        loading: false,
        error: null,
        uploading: false,
        selectedFileId: null,
      }
    })

    describe('addFile', () => {
      it('should add file to beginning of items', () => {
        const state = filesReducer(initialState, addFile(mockFile2))

        expect(state.items[0]).toEqual(mockFile2)
        expect(state.items[1]).toEqual(mockFile)
        expect(state.items.length).toBe(2)
      })

      it('should handle adding to empty state', () => {
        const emptyState: FilesState = {
          items: [],
          loading: false,
          error: null,
          uploading: false,
          selectedFileId: null,
        }

        const state = filesReducer(emptyState, addFile(mockFile))

        expect(state.items).toEqual([mockFile])
      })
    })

    describe('replaceFile', () => {
      it('should replace file with matching id', () => {
        const updatedFile: CreativeFileWithMetadata = {
          ...mockFile,
          filename: 'updated.jpg',
        }

        const state = filesReducer(initialState, replaceFile(updatedFile))

        expect(state.items[0]).toEqual(updatedFile)
        expect(state.items[0].filename).toBe('updated.jpg')
      })

      it('should not change items if id does not match', () => {
        const noMatchFile: CreativeFileWithMetadata = {
          ...mockFile2,
          id: 'file-999',
        }

        const state = filesReducer(initialState, replaceFile(noMatchFile))

        expect(state.items).toEqual(initialState.items)
      })

      it('should work with multiple items', () => {
        const stateWithMultiple: FilesState = {
          ...initialState,
          items: [mockFile, mockFile2],
        }

        const updatedFile2 = { ...mockFile2, filename: 'updated2.jpg' }
        const state = filesReducer(stateWithMultiple, replaceFile(updatedFile2))

        expect(state.items[0]).toEqual(mockFile)
        expect(state.items[1]).toEqual(updatedFile2)
      })
    })

    describe('selectFile', () => {
      it('should set selectedFileId', () => {
        const state = filesReducer(initialState, selectFile('file-1'))

        expect(state.selectedFileId).toBe('file-1')
      })

      it('should clear selectedFileId when passed null', () => {
        const stateWithSelection: FilesState = {
          ...initialState,
          selectedFileId: 'file-1',
        }

        const state = filesReducer(stateWithSelection, selectFile(null))

        expect(state.selectedFileId).toBeNull()
      })
    })

    describe('clearFilesError', () => {
      it('should clear error', () => {
        const stateWithError: FilesState = {
          ...initialState,
          error: 'Some error message',
        }

        const state = filesReducer(stateWithError, clearFilesError())

        expect(state.error).toBeNull()
      })

      it('should not affect other state properties', () => {
        const stateWithError: FilesState = {
          ...initialState,
          error: 'Some error message',
          selectedFileId: 'file-1',
        }

        const state = filesReducer(stateWithError, clearFilesError())

        expect(state.error).toBeNull()
        expect(state.selectedFileId).toBe('file-1')
        expect(state.items).toEqual(initialState.items)
      })
    })
  })

  describe('async thunks', () => {
    describe('fetchFiles', () => {
      it('should handle successful fetch', async () => {
        const mockResponse = [mockFile, mockFile2]
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        const store = configureStore({
          reducer: { files: filesReducer },
        })

        await store.dispatch(fetchFiles())
        const state = store.getState().files

        expect(state.loading).toBe(false)
        expect(state.items).toEqual(mockResponse)
        expect(state.error).toBeNull()
      })

      it('should handle fetch error', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Fetch failed' }),
        })

        const store = configureStore({
          reducer: { files: filesReducer },
        })

        await store.dispatch(fetchFiles())
        const state = store.getState().files

        expect(state.loading).toBe(false)
        expect(state.error).toBeDefined()
        expect(state.items).toEqual([])
      })

      it('should build correct URL with projectId', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        })

        const store = configureStore({
          reducer: { files: filesReducer },
        })

        await store.dispatch(fetchFiles({ projectId: 'proj-123' }))

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('projectId=proj-123')
        )
      })

      it('should build correct URL with scope', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        })

        const store = configureStore({
          reducer: { files: filesReducer },
        })

        await store.dispatch(fetchFiles({ scope: 'media' }))

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('scope=media')
        )
      })

      it('should not include scope if it is "all"', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        })

        const store = configureStore({
          reducer: { files: filesReducer },
        })

        await store.dispatch(fetchFiles({ scope: 'all' }))

        expect(global.fetch).toHaveBeenCalledWith('/api/files')
      })

      it('should set loading to true during fetch', () => {
        ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
          new Promise(() => {})
        )

        const store = configureStore({
          reducer: { files: filesReducer },
        })

        store.dispatch(fetchFiles())
        const state = store.getState().files

        expect(state.loading).toBe(true)
      })
    })

    describe('uploadFile', () => {
      it('should handle successful upload', async () => {
        const mockResponse = { file: mockFile }
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        const store = configureStore({
          reducer: { files: filesReducer },
        })

        const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
        await store.dispatch(uploadFile({ file, projectId: 'proj-123' }))

        const state = store.getState().files

        expect(state.uploading).toBe(false)
        expect(state.items[0]).toEqual(mockFile)
        expect(state.selectedFileId).toBe(mockFile.id)
        expect(state.error).toBeNull()
      })

      it('should handle upload error', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Upload failed' }),
        })

        const store = configureStore({
          reducer: { files: filesReducer },
        })

        const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
        await store.dispatch(uploadFile({ file }))

        const state = store.getState().files

        expect(state.uploading).toBe(false)
        expect(state.error).toBeDefined()
      })

      it('should include projectId in form data', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ file: mockFile }),
        })

        const store = configureStore({
          reducer: { files: filesReducer },
        })

        const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
        await store.dispatch(uploadFile({ file, projectId: 'proj-123' }))

        const call = (global.fetch as jest.Mock).mock.calls[0]
        const formData = call[1].body as FormData
        expect(formData.get('projectId')).toBe('proj-123')
      })

      it('should include scope in form data if not "all"', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ file: mockFile }),
        })

        const store = configureStore({
          reducer: { files: filesReducer },
        })

        const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
        await store.dispatch(uploadFile({ file, scope: 'media' }))

        const call = (global.fetch as jest.Mock).mock.calls[0]
        const formData = call[1].body as FormData
        expect(formData.get('scope')).toBe('media')
      })

      it('should not include scope if it is "all"', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ file: mockFile }),
        })

        const store = configureStore({
          reducer: { files: filesReducer },
        })

        const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
        await store.dispatch(uploadFile({ file, scope: 'all' }))

        const call = (global.fetch as jest.Mock).mock.calls[0]
        const formData = call[1].body as FormData
        expect(formData.get('scope')).toBeNull()
      })

      it('should set uploading to true during upload', () => {
        ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
          new Promise(() => {})
        )

        const store = configureStore({
          reducer: { files: filesReducer },
        })

        const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
        store.dispatch(uploadFile({ file }))

        const state = store.getState().files
        expect(state.uploading).toBe(true)
      })

      it('should handle mutation response with versioning', async () => {
        const mockResponse = {
          file: mockFile,
          versioning: { version: 1, status: 'pending' },
        }
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        const store = configureStore({
          reducer: {
            files: filesReducer,
            versioning: (state = {}) => state,
          },
        })

        const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
        await store.dispatch(uploadFile({ file }))

        const state = store.getState().files
        expect(state.items[0]).toEqual(mockFile)
      })
    })
  })

  describe('integration', () => {
    it('should handle sequence of actions', () => {
      let state = filesReducer(undefined, { type: 'unknown' })

      // Add file
      state = filesReducer(state, addFile(mockFile))
      expect(state.items.length).toBe(1)
      expect(state.items[0]).toEqual(mockFile)

      // Add another file
      state = filesReducer(state, addFile(mockFile2))
      expect(state.items.length).toBe(2)
      expect(state.items[0]).toEqual(mockFile2)

      // Select file
      state = filesReducer(state, selectFile('file-1'))
      expect(state.selectedFileId).toBe('file-1')

      // Replace file
      const updatedFile = { ...mockFile, filename: 'updated.jpg' }
      state = filesReducer(state, replaceFile(updatedFile))
      expect(state.items[1].filename).toBe('updated.jpg')

      // Clear error
      state = filesReducer(
        { ...state, error: 'Some error' },
        clearFilesError()
      )
      expect(state.error).toBeNull()
    })
  })
})
