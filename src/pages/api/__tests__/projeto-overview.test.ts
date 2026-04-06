import { NextApiRequest, NextApiResponse } from 'next'
import handler from '../projeto/[id]/overview/index'
import prisma from '@/lib/prisma'
import * as creativeFiles from '@/lib/creativeFiles'
import * as projectWorkspace from '@/lib/projectWorkspace'
import * as projectLibrary from '@/lib/projectLibrary'
import * as overview from '@/lib/overview'

jest.mock('@/lib/prisma', () => ({
  creativeFile: {
    findMany: jest.fn(),
  },
  projectLibraryItem: {
    findMany: jest.fn(),
  },
}))

jest.mock('@/lib/creativeFiles', () => ({
  serializeCreativeFile: jest.fn((file) => ({
    ...file,
    serialized: true,
  })),
}))

jest.mock('@/lib/projectWorkspace', () => ({
  getTaggedValue: jest.fn((tags, prefix) => {
    if (!tags || !Array.isArray(tags)) return null
    const found = tags.find((t: string) => t.startsWith(prefix))
    return found ? found.replace(prefix, '') : null
  }),
  hasTag: jest.fn((tags, tag) => tags && tags.includes(tag)),
}))

jest.mock('@/lib/projectLibrary', () => ({
  serializeProjectLibraryItem: jest.fn((item) => ({
    ...item,
    serialized: true,
  })),
}))

jest.mock('@/lib/overview', () => ({
  getOverviewOriginHref: jest.fn((projectId, domain) => `/projeto/${projectId}/${domain.toLowerCase()}`),
}))

describe('GET /api/projeto/[id]/overview', () => {
  let req: Partial<NextApiRequest>
  let res: Partial<NextApiResponse>
  let statusMock: jest.Mock
  let jsonMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    statusMock = jest.fn().mockReturnThis()
    jsonMock = jest.fn().mockReturnThis()

    req = {
      method: 'GET',
      query: { id: 'proj-123' },
    }

    res = {
      status: statusMock,
      json: jsonMock,
    }
  })

  describe('Validation', () => {
    it('should return 400 when project ID is not a string', async () => {
      req.query = { id: ['proj-1', 'proj-2'] }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid project ID' })
    })

    it('should return 405 for non-GET requests', async () => {
      req.method = 'POST'

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(405)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })
  })

  describe('Data retrieval', () => {
    const mockFiles = [
      {
        id: 'file-1',
        filename: 'logo.png',
        type: 'image',
        mimeType: 'image/png',
        createdAt: new Date('2026-04-01'),
        updatedAt: new Date('2026-04-01'),
        metadata: {
          tags: ['project-proj-123', 'scope:brand'],
          status: 'Approved',
          type: 'image',
          notes: 'Main logo',
        },
      },
    ]

    const mockLibraryItems = [
      {
        id: 'lib-1',
        domain: 'BRAND_CORE',
        category: 'LOGOS',
        title: 'Logo Set',
        status: 'Approved',
        kind: 'ASSET',
        description: 'Complete logo set',
        assetFile: { id: 'file-2', filename: 'logo-set.zip', mimeType: 'application/zip' },
        assetPreviewUrl: null,
        assetFilename: 'logo-set.zip',
        assetMimeType: 'application/zip',
        createdAt: '2026-04-01T10:00:00Z',
        updatedAt: '2026-04-01T10:00:00Z',
        relatedItems: [],
        payload: {},
        outgoingRelations: [],
      },
    ]

    beforeEach(() => {
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue(mockFiles)
      ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue(mockLibraryItems)
    })

    it('should fetch files and library items', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(prisma.creativeFile.findMany).toHaveBeenCalled()
      expect(prisma.projectLibraryItem.findMany).toHaveBeenCalled()
    })

    it('should return 200 with items', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({
        items: expect.any(Array),
      })
    })

    it('should combine files and library items', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      expect(call.items.length).toBeGreaterThan(0)
    })
  })

  describe('Filtering - Domain', () => {
    const mockFiles = [
      {
        id: 'file-1',
        filename: 'test.png',
        type: 'image',
        mimeType: 'image/png',
        createdAt: new Date('2026-04-01'),
        updatedAt: new Date('2026-04-01'),
        metadata: {
          tags: ['project-proj-123'],
          status: 'Draft',
          type: 'image',
          notes: null,
        },
      },
    ]

    const mockLibraryItems = [
      {
        id: 'lib-1',
        domain: 'BRAND_CORE',
        category: 'LOGOS',
        title: 'Logo',
        status: 'Approved',
        kind: 'ASSET',
        description: null,
        assetFile: null,
        assetPreviewUrl: null,
        assetFilename: null,
        assetMimeType: null,
        createdAt: '2026-04-01T10:00:00Z',
        updatedAt: '2026-04-01T10:00:00Z',
        relatedItems: [],
        payload: {},
        outgoingRelations: [],
      },
      {
        id: 'lib-2',
        domain: 'STRATEGY',
        category: 'VISION',
        title: 'Vision',
        status: 'Draft',
        kind: 'GUIDELINE',
        description: null,
        assetFile: null,
        assetPreviewUrl: null,
        assetFilename: null,
        assetMimeType: null,
        createdAt: '2026-04-02T10:00:00Z',
        updatedAt: '2026-04-02T10:00:00Z',
        relatedItems: [],
        payload: {},
        outgoingRelations: [],
      },
    ]

    beforeEach(() => {
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue(mockFiles)
      ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue(mockLibraryItems)
    })

    it('should filter by domain', async () => {
      req.query = { id: 'proj-123', domain: 'BRAND_CORE' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      // Should only include BRAND_CORE and MEDIA_LIBRARY (file domain)
      call.items.forEach((item: any) => {
        expect(['BRAND_CORE', 'MEDIA_LIBRARY']).toContain(item.sourceDomain)
      })
    })

    it('should return all items when domain is ALL', async () => {
      req.query = { id: 'proj-123', domain: 'ALL' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
    })
  })

  describe('Filtering - Category', () => {
    const mockFiles = []
    const mockLibraryItems = [
      {
        id: 'lib-1',
        domain: 'BRAND_CORE',
        category: 'LOGOS',
        title: 'Logo 1',
        status: 'Approved',
        kind: 'ASSET',
        description: null,
        assetFile: null,
        assetPreviewUrl: null,
        assetFilename: null,
        assetMimeType: null,
        createdAt: '2026-04-01T10:00:00Z',
        updatedAt: '2026-04-01T10:00:00Z',
        relatedItems: [],
        payload: {},
        outgoingRelations: [],
      },
      {
        id: 'lib-2',
        domain: 'BRAND_CORE',
        category: 'COLORS',
        title: 'Color Palette',
        status: 'Approved',
        kind: 'GUIDELINE',
        description: null,
        assetFile: null,
        assetPreviewUrl: null,
        assetFilename: null,
        assetMimeType: null,
        createdAt: '2026-04-02T10:00:00Z',
        updatedAt: '2026-04-02T10:00:00Z',
        relatedItems: [],
        payload: {},
        outgoingRelations: [],
      },
    ]

    beforeEach(() => {
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue(mockFiles)
      ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue(mockLibraryItems)
    })

    it('should filter by category', async () => {
      req.query = { id: 'proj-123', category: 'LOGOS' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      call.items.forEach((item: any) => {
        expect(item.category).toBe('LOGOS')
      })
    })
  })

  describe('Filtering - Status', () => {
    const mockFiles = [
      {
        id: 'file-1',
        filename: 'draft.png',
        type: 'image',
        mimeType: 'image/png',
        createdAt: new Date('2026-04-01'),
        updatedAt: new Date('2026-04-01'),
        metadata: {
          tags: ['project-proj-123'],
          status: 'Draft',
          type: 'image',
          notes: null,
        },
      },
      {
        id: 'file-2',
        filename: 'approved.png',
        type: 'image',
        mimeType: 'image/png',
        createdAt: new Date('2026-04-02'),
        updatedAt: new Date('2026-04-02'),
        metadata: {
          tags: ['project-proj-123'],
          status: 'Approved',
          type: 'image',
          notes: null,
        },
      },
    ]

    beforeEach(() => {
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue(mockFiles)
      ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue([])
    })

    it('should filter by status', async () => {
      req.query = { id: 'proj-123', status: 'Approved' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      call.items.forEach((item: any) => {
        expect(item.status).toBe('Approved')
      })
    })
  })

  describe('Filtering - Search', () => {
    const mockFiles = [
      {
        id: 'file-1',
        filename: 'logo.png',
        type: 'image',
        mimeType: 'image/png',
        createdAt: new Date('2026-04-01'),
        updatedAt: new Date('2026-04-01'),
        metadata: {
          tags: ['project-proj-123', 'brand'],
          status: 'Approved',
          type: 'image',
          notes: 'Main company logo',
        },
      },
      {
        id: 'file-2',
        filename: 'icon.svg',
        type: 'image',
        mimeType: 'image/svg+xml',
        createdAt: new Date('2026-04-02'),
        updatedAt: new Date('2026-04-02'),
        metadata: {
          tags: ['project-proj-123'],
          status: 'Draft',
          type: 'image',
          notes: null,
        },
      },
    ]

    beforeEach(() => {
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue(mockFiles)
      ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue([])
    })

    it('should filter by search query in title', async () => {
      req.query = { id: 'proj-123', search: 'logo' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      expect(call.items.length).toBeGreaterThan(0)
      call.items.forEach((item: any) => {
        expect(item.title.toLowerCase()).toContain('logo')
      })
    })

    it('should filter by search query in notes', async () => {
      req.query = { id: 'proj-123', search: 'company logo' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      expect(call.items.length).toBeGreaterThan(0)
    })

    it('should be case insensitive', async () => {
      req.query = { id: 'proj-123', search: 'LOGO' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      expect(call.items.length).toBeGreaterThan(0)
    })
  })

  describe('Filtering - Asset presence', () => {
    const mockFiles = [
      {
        id: 'file-1',
        filename: 'image.png',
        type: 'image',
        mimeType: 'image/png',
        createdAt: new Date('2026-04-01'),
        updatedAt: new Date('2026-04-01'),
        metadata: {
          tags: ['project-proj-123'],
          status: 'Draft',
          type: 'image',
          notes: null,
        },
      },
    ]

    const mockLibraryItems = [
      {
        id: 'lib-1',
        domain: 'BRAND_CORE',
        category: 'LOGOS',
        title: 'Logo without asset',
        status: 'Draft',
        kind: 'GUIDELINE',
        description: null,
        assetFile: null,
        assetPreviewUrl: null,
        assetFilename: null,
        assetMimeType: null,
        createdAt: '2026-04-01T10:00:00Z',
        updatedAt: '2026-04-01T10:00:00Z',
        relatedItems: [],
        payload: {},
        outgoingRelations: [],
      },
    ]

    beforeEach(() => {
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue(mockFiles)
      ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue(mockLibraryItems)
    })

    it('should filter by withAsset flag', async () => {
      req.query = { id: 'proj-123', withAsset: 'true' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      call.items.forEach((item: any) => {
        expect(item.previewUrl || item.filename).toBeTruthy()
      })
    })
  })

  describe('Sorting', () => {
    const mockFiles = [
      {
        id: 'file-1',
        filename: 'zebra.png',
        type: 'image',
        mimeType: 'image/png',
        createdAt: new Date('2026-04-01'),
        updatedAt: new Date('2026-04-03'),
        metadata: {
          tags: ['project-proj-123'],
          status: 'Draft',
          type: 'image',
          notes: null,
        },
      },
      {
        id: 'file-2',
        filename: 'apple.png',
        type: 'image',
        mimeType: 'image/png',
        createdAt: new Date('2026-04-02'),
        updatedAt: new Date('2026-04-02'),
        metadata: {
          tags: ['project-proj-123'],
          status: 'Draft',
          type: 'image',
          notes: null,
        },
      },
      {
        id: 'file-3',
        filename: 'banana.png',
        type: 'image',
        mimeType: 'image/png',
        createdAt: new Date('2026-04-03'),
        updatedAt: new Date('2026-04-01'),
        metadata: {
          tags: ['project-proj-123'],
          status: 'Draft',
          type: 'image',
          notes: null,
        },
      },
    ]

    beforeEach(() => {
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue(mockFiles)
      ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue([])
    })

    it('should sort newest by default', async () => {
      req.query = { id: 'proj-123' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      expect(call.items[0].id).toBe('file-3') // banana, created 2026-04-03
    })

    it('should sort by oldest', async () => {
      req.query = { id: 'proj-123', sort: 'oldest' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      expect(call.items[0].id).toBe('file-1') // zebra, created 2026-04-01
    })

    it('should sort by name ascending', async () => {
      req.query = { id: 'proj-123', sort: 'name-asc' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      expect(call.items[0].title).toBe('apple.png')
      expect(call.items[1].title).toBe('banana.png')
      expect(call.items[2].title).toBe('zebra.png')
    })

    it('should sort by name descending', async () => {
      req.query = { id: 'proj-123', sort: 'name-desc' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      expect(call.items[0].title).toBe('zebra.png')
      expect(call.items[1].title).toBe('banana.png')
      expect(call.items[2].title).toBe('apple.png')
    })

    it('should sort by updated', async () => {
      req.query = { id: 'proj-123', sort: 'updated' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      expect(call.items[0].id).toBe('file-1') // zebra, updated 2026-04-03
    })
  })

  describe('Error handling', () => {
    beforeEach(() => {
      ;(prisma.creativeFile.findMany as jest.Mock).mockRejectedValue(new Error('DB error'))
    })

    it('should return 500 on database error', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Failed to fetch overview entries',
      })
    })
  })
})
