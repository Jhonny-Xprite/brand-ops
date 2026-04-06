import { NextApiRequest, NextApiResponse } from 'next'
import handler from '../files/[id]/versions'
import prisma from '@/lib/prisma'
import { historyReader } from '@/lib/versioning/historyReader'

jest.mock('@/lib/prisma', () => ({
  creativeFile: {
    findUnique: jest.fn(),
  },
}))

jest.mock('@/lib/versioning/historyReader', () => ({
  historyReader: {
    readTimeline: jest.fn(),
  },
}))

describe('GET /api/files/[id]/versions', () => {
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
      query: { id: 'file-123' },
    }

    res = {
      status: statusMock,
      json: jsonMock,
    }
  })

  it('should return 400 when ID is not a string', async () => {
    req.query = { id: ['file-123', 'file-456'] }

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid ID' })
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

  it('should return 404 when file not found', async () => {
    ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(null)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(404)
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'This item could not be loaded. Refresh and try again.',
    })
  })

  it('should return versions timeline when file found', async () => {
    const mockFile = { id: 'file-123' }
    const mockVersions = [
      { version: 1, timestamp: '2024-01-01T00:00:00Z', status: 'committed' },
      { version: 2, timestamp: '2024-01-02T00:00:00Z', status: 'pending' },
    ]

    ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
    ;(historyReader.readTimeline as jest.Mock).mockResolvedValue(mockVersions)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith({
      versions: mockVersions,
    })
  })

  it('should call readTimeline with file ID', async () => {
    const mockFile = { id: 'file-123' }
    ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
    ;(historyReader.readTimeline as jest.Mock).mockResolvedValue([])

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(historyReader.readTimeline).toHaveBeenCalledWith('file-123')
  })

  it('should return empty versions array when no versions exist', async () => {
    const mockFile = { id: 'file-123' }
    ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
    ;(historyReader.readTimeline as jest.Mock).mockResolvedValue([])

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith({ versions: [] })
  })

  it('should handle database errors with 500', async () => {
    ;(prisma.creativeFile.findUnique as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(500)
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Version history is unavailable right now. Try again.',
    })
  })

  it('should handle version history reader errors with 500', async () => {
    const mockFile = { id: 'file-123' }
    ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
    ;(historyReader.readTimeline as jest.Mock).mockRejectedValue(
      new Error('History unavailable')
    )

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(500)
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Version history is unavailable right now. Try again.',
    })
  })

  it('should not call readTimeline when file not found', async () => {
    ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(null)

    await handler(req as NextApiRequest, res as NextApiResponse)

    // Should not call readTimeline if file doesn't exist
    expect(historyReader.readTimeline).not.toHaveBeenCalled()
  })

  it('should select only id field from file query', async () => {
    const mockFile = { id: 'file-123' }
    ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
    ;(historyReader.readTimeline as jest.Mock).mockResolvedValue([])

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(prisma.creativeFile.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: { id: true },
      })
    )
  })

  it('should use unique query for file lookup', async () => {
    const mockFile = { id: 'file-123' }
    ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
    ;(historyReader.readTimeline as jest.Mock).mockResolvedValue([])

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(prisma.creativeFile.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'file-123' },
      })
    )
  })
})
