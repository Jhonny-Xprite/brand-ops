import { NextApiRequest, NextApiResponse } from 'next'
import handler from '../projeto/[id]/library'
import prisma from '@/lib/prisma'
import * as projectDomain from '@/lib/projectDomain'
import * as projectLibrary from '@/lib/projectLibrary'

jest.mock('@/lib/prisma', () => ({
  project: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  projectLibraryItem: {
    findMany: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    findUniqueOrThrow: jest.fn(),
  },
  projectLibraryItemRelation: {
    createMany: jest.fn(),
  },
  $transaction: jest.fn(),
}))

jest.mock('@/lib/projectDomain', () => ({
  isProjectLibraryDomain: jest.fn((domain) =>
    ['BRAND_CORE', 'BRAND_VOICE', 'VISUAL_SYSTEM', 'CONTENT_STRATEGY'].includes(domain)
  ),
  isProjectLibraryItemKind: jest.fn((kind) =>
    ['NOTE', 'GUIDELINE', 'TEMPLATE', 'ASSET'].includes(kind)
  ),
  isProjectLibraryRelationType: jest.fn((type) =>
    ['REFERENCES', 'EXTENDS', 'DEPENDS_ON'].includes(type)
  ),
  serializeProjectLibraryPayload: jest.fn((payload) => payload),
}))

jest.mock('@/lib/projectLibrary', () => ({
  serializeProjectLibraryItem: jest.fn((item) => ({
    ...item,
    serialized: true,
  })),
}))

describe('GET /api/projeto/[id]/library', () => {
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

  it('should return 400 when project ID is missing', async () => {
    req.query = { id: undefined }

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid project ID' })
  })

  it('should return 400 when project ID is not string', async () => {
    req.query = { id: ['proj-1', 'proj-2'] }

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid project ID' })
  })

  it('should return 404 when project not found', async () => {
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(null)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(404)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Project not found' })
  })

  it('should return library items when found', async () => {
    const mockProject = { id: 'proj-123' }
    const mockItems = [
      { id: 'item-1', title: 'Logo', domain: 'BRAND_CORE' },
      { id: 'item-2', title: 'Brand Voice', domain: 'BRAND_VOICE' },
    ]

    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
    ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue(mockItems)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith({
      items: expect.any(Array),
    })
  })

  it('should filter by domain when provided', async () => {
    req.query = { id: 'proj-123', domain: 'BRAND_CORE' }

    const mockProject = { id: 'proj-123' }
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
    ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue([])

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(prisma.projectLibraryItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          domain: 'BRAND_CORE',
        }),
      })
    )
  })

  it('should return 400 for invalid domain', async () => {
    req.query = { id: 'proj-123', domain: 'INVALID_DOMAIN' }

    const mockProject = { id: 'proj-123' }
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
    ;(projectDomain.isProjectLibraryDomain as unknown as jest.Mock).mockReturnValue(false)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid library domain' })
  })

  it('should filter by category when provided', async () => {
    req.query = { id: 'proj-123', category: 'LOGOTIPOS' }

    const mockProject = { id: 'proj-123' }
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
    ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue([])

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(prisma.projectLibraryItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: 'LOGOTIPOS',
        }),
      })
    )
  })

  it('should search in title, description, and content', async () => {
    req.query = { id: 'proj-123', search: 'logo' }

    const mockProject = { id: 'proj-123' }
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
    ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue([])

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(prisma.projectLibraryItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ title: { contains: 'logo' } }),
            expect.objectContaining({ description: { contains: 'logo' } }),
            expect.objectContaining({ content: { contains: 'logo' } }),
          ]),
        }),
      })
    )
  })

  it('should return 500 on database error', async () => {
    const mockProject = { id: 'proj-123' }
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
    ;(prisma.projectLibraryItem.findMany as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(500)
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Failed to fetch library items',
    })
  })
})

describe('POST /api/projeto/[id]/library', () => {
  let req: Partial<NextApiRequest>
  let res: Partial<NextApiResponse>
  let statusMock: jest.Mock
  let jsonMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    statusMock = jest.fn().mockReturnThis()
    jsonMock = jest.fn().mockReturnThis()

    req = {
      method: 'POST',
      query: { id: 'proj-123' },
      body: {
        domain: 'BRAND_CORE',
        category: 'LOGOTIPOS',
        title: 'Main Logo',
        kind: 'ASSET',
      },
    }

    res = {
      status: statusMock,
      json: jsonMock,
    }
  })

  it('should return 400 when domain is invalid', async () => {
    req.body = { domain: 'INVALID', category: 'TEST', title: 'Test' }

    const mockProject = { id: 'proj-123' }
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
    ;(projectDomain.isProjectLibraryDomain as unknown as jest.Mock).mockReturnValue(false)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid library domain' })
  })

  it('should return 400 when category is missing', async () => {
    req.body = { domain: 'BRAND_CORE', category: '', title: 'Test' }

    const mockProject = { id: 'proj-123' }
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
    ;(projectDomain.isProjectLibraryDomain as unknown as jest.Mock).mockReturnValue(true)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Category is required' })
  })

  it('should return 400 when title is missing', async () => {
    req.body = { domain: 'BRAND_CORE', category: 'LOGOTIPOS', title: '' }

    const mockProject = { id: 'proj-123' }
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
    ;(projectDomain.isProjectLibraryDomain as unknown as jest.Mock).mockReturnValue(true)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Title is required' })
  })

  it('should validate required fields before processing', async () => {
    // This test validates field validation logic happens before transaction
    const mockProject = { id: 'proj-123' }
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)

    // Test with missing title - should fail validation
    req.body = { domain: 'BRAND_CORE', category: 'LOGOTIPOS', title: '' }
    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
  })

  it('should return 500 on creation error', async () => {
    req.body = { domain: 'BRAND_CORE', category: 'TEST', title: 'Test' }

    const mockProject = { id: 'proj-123' }
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
    ;(projectDomain.isProjectLibraryDomain as unknown as jest.Mock).mockReturnValue(true)
    ;(prisma.$transaction as jest.Mock).mockRejectedValue(
      new Error('Transaction failed')
    )

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(500)
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Failed to create library item',
    })
  })
})

describe('Invalid Methods /api/projeto/[id]/library', () => {
  let req: Partial<NextApiRequest>
  let res: Partial<NextApiResponse>
  let statusMock: jest.Mock
  let jsonMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    statusMock = jest.fn().mockReturnThis()
    jsonMock = jest.fn().mockReturnThis()

    req = {
      method: 'DELETE',
      query: { id: 'proj-123' },
    }

    res = {
      status: statusMock,
      json: jsonMock,
    }
  })

  it('should return 405 for DELETE', async () => {
    const mockProject = { id: 'proj-123' }
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(405)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('should return 405 for PATCH', async () => {
    req.method = 'PATCH'

    const mockProject = { id: 'proj-123' }
    ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(405)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })
})
