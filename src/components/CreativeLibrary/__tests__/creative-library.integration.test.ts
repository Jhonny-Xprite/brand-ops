import { filterAndSortFiles } from '@/lib/creativeLibraryBrowser'
import type { CreativeFileWithMetadata } from '@/lib/types'
import { createAppStore } from '@/store'
import { fetchFiles, selectFile } from '@/store/creativeLibrary/files.slice'
import { updateMetadata } from '@/store/creativeLibrary/metadata.slice'

function createJsonResponse(data: unknown, ok = true) {
  return {
    ok,
    json: async () => data,
  } as Response
}

describe('creative library integration flow', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('keeps browse state coherent after metadata edits and reload', async () => {
    let persistedFile: CreativeFileWithMetadata = {
      id: 'file-1',
      path: 'E:\\BRAND-OPS-STORAGE\\launch.png',
      filename: 'launch.png',
      type: 'image',
      size: BigInt(2048),
      mimeType: 'image/png',
      createdAt: new Date('2026-04-04T10:00:00.000Z'),
      updatedAt: new Date('2026-04-04T10:00:00.000Z'),
      metadata: {
        id: 'meta-1',
        fileId: 'file-1',
        type: 'image',
        status: 'Draft',
        tags: ['launch'],
        notes: 'Initial notes',
        updatedAt: new Date('2026-04-04T10:00:00.000Z'),
      },
    }

    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'

      if (url === '/api/files' && method === 'GET') {
        return createJsonResponse([persistedFile])
      }

      if (url === '/api/files/file-1' && method === 'PATCH') {
        const body = JSON.parse(String(init?.body))

        persistedFile = {
          ...persistedFile,
          type: body.type,
          updatedAt: new Date('2026-04-04T10:05:00.000Z'),
          metadata: {
            ...persistedFile.metadata!,
            type: body.type,
            status: body.status,
            tags: body.tags,
            notes: body.notes,
            updatedAt: new Date('2026-04-04T10:05:00.000Z'),
          },
        }

        return createJsonResponse(persistedFile)
      }

      throw new Error(`Unhandled fetch: ${method} ${url}`)
    }) as typeof fetch

    const firstStore = createAppStore()

    await firstStore.dispatch(fetchFiles()).unwrap()
    firstStore.dispatch(selectFile('file-1'))

    const initialDraftView = filterAndSortFiles(firstStore.getState().files.items, {
      searchTerm: '',
      typeFilter: 'all',
      statusFilter: 'Draft',
      sortOrder: 'newest',
    })

    expect(initialDraftView).toHaveLength(1)

    await firstStore
      .dispatch(
        updateMetadata({
          fileId: 'file-1',
          metadata: {
            type: 'image',
            status: 'Approved',
            tags: ['launch', 'hero'],
            notes: 'Initial notes',
          },
        }),
      )
      .unwrap()

    const draftViewAfterEdit = filterAndSortFiles(firstStore.getState().files.items, {
      searchTerm: '',
      typeFilter: 'all',
      statusFilter: 'Draft',
      sortOrder: 'newest',
    })
    const approvedViewAfterEdit = filterAndSortFiles(firstStore.getState().files.items, {
      searchTerm: 'launch',
      typeFilter: 'all',
      statusFilter: 'Approved',
      sortOrder: 'name-asc',
    })

    expect(draftViewAfterEdit).toHaveLength(0)
    expect(approvedViewAfterEdit).toHaveLength(1)
    expect(approvedViewAfterEdit[0]?.metadata?.status).toBe('Approved')
    expect(approvedViewAfterEdit[0]?.metadata?.tags).toEqual(['launch', 'hero'])

    const secondStore = createAppStore()
    await secondStore.dispatch(fetchFiles()).unwrap()

    const reloadedFile = secondStore.getState().files.items[0]

    expect(reloadedFile?.metadata?.status).toBe('Approved')
    expect(reloadedFile?.metadata?.tags).toContain('hero')
  })
})
