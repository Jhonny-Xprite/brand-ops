import { NextApiRequest, NextApiResponse } from 'next'
import handler from '../files/index'
import prisma from '@/lib/prisma'
import { serializeCreativeFile } from '@/lib/creativeFiles'

jest.mock('@/lib/prisma', () => ({
  creativeFile: {
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
  buildProjectWorkspaceWhere: jest.fn((projectId, scope) => ({
    metadata: {
      tags: {
        contains: `project-${projectId}`,
      },
    },
  })),
}))

describe('GET /api/files', () => {
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
      query: {},
    }

    res = {
      status: statusMock,
      json: jsonMock,
    }
  })

  it('should return all files with 200 status', async () => {
    const mockFiles = [
      {
        id: '1',
        path: '/files/1.jpg',
        filename: 'image1.jpg',
        metadata: { tags: [] },
      },
      {
        id: '2',
        path: '/files/2.jpg',
        filename: 'image2.jpg',
        metadata: { tags: [] },
      },
    ]

    ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue(mockFiles)
    ;(serializeCreativeFile as jest.Mock).mockImplementation((file) => ({
      ...file,
      serialized: true,
    }))

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: '1', serialized: true }),
        expect.objectContaining({ id: '2', serialized: true }),
      ])
    )
  })

  it('should filter files by projectId when provided', async () => {
    req.query = { projectId: 'project-123', scope: 'all' }

    const mockFiles = [
      {
        id: '1',
        path: '/files/1.jpg',
        metadata: { tags: ['project-project-123'] },
      },
    ]

    ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue(mockFiles)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(prisma.creativeFile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.any(Object),
        include: { metadata: true },
        orderBy: { createdAt: 'desc' },
      })
    )
  })

  it('should return empty array when no files exist', async () => {
    ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue([])

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith([])
  })

  it('should handle database errors with 500 status', async () => {
    ;(prisma.creativeFile.findMany as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    )

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(500)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to fetch files' })
  })

  it('should return 405 for non-GET requests', async () => {
    req.method = 'POST'

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(405)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('should return 405 for DELETE requests', async () => {
    req.method = 'DELETE'

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(405)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('should return 405 for PATCH requests', async () => {
    req.method = 'PATCH'

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(405)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('should order files by createdAt descending', async () => {
    const mockFiles = [
      { id: '1', createdAt: new Date('2024-01-01') },
      { id: '2', createdAt: new Date('2024-01-02') },
    ]

    ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue(mockFiles)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(prisma.creativeFile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    )
  })

  it('should include metadata in query', async () => {
    ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue([])

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(prisma.creativeFile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { metadata: true },
      })
    )
  })
})
