import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import handler from '../files/[id]'
import prisma from '@/lib/prisma'
import { serializeCreativeFile } from '@/lib/creativeFiles'
import { versioningService } from '@/lib/versioning'

jest.mock('@/lib/prisma', () => ({
  creativeFile: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  fileMetadata: {
    upsert: jest.fn(),
  },
}))

jest.mock('@/lib/creativeFiles', () => ({
  serializeCreativeFile: jest.fn((file) => ({
    ...file,
    serialized: true,
  })),
}))

jest.mock('@/lib/versioning', () => ({
  versioningService: {
    requestVersionedChange: jest.fn(),
  },
}))

jest.mock('@/lib/fileValidation', () => ({
  loadFileValidationConfig: jest.fn(() => ({
    maxSizeMB: 50,
    allowedTypes: ['jpg', 'jpeg', 'png', 'gif'],
  })),
  validateFileUpload: jest.fn((_filename, _size, _mimeType, _config) => ({
    isValid: true,
  })),
  getHttpStatusCode: jest.fn((result) => (result.isValid ? 200 : 400)),
}))

jest.mock('fs')

describe('GET /api/files/[id]', () => {
  let req: Partial<NextApiRequest>
  let res: Partial<NextApiResponse>
  let statusMock: jest.Mock
  let jsonMock: jest.Mock
  let setHeaderMock: jest.Mock
  let pipeStreamMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    statusMock = jest.fn().mockReturnThis()
    jsonMock = jest.fn().mockReturnThis()
    setHeaderMock = jest.fn().mockReturnThis()
    pipeStreamMock = jest.fn().mockReturnValue(undefined)

    req = {
      method: 'GET',
      query: { id: 'file-123' },
    }

    res = {
      status: statusMock,
      json: jsonMock,
      setHeader: setHeaderMock,
    }
  })

  it('should return 400 when ID is not a string', async () => {
    req.query = { id: ['file-123', 'file-456'] }

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid ID' })
  })

  it('should return file metadata when found', async () => {
    const mockFile = {
      id: 'file-123',
      filename: 'test.jpg',
      path: '/files/test.jpg',
      mimeType: 'image/jpeg',
      type: 'image',
      metadata: { status: 'Published' },
    }

    ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
    ;(versioningService.requestVersionedChange as jest.Mock).mockResolvedValue({
      state: { version: 1 },
    })

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        file: expect.objectContaining({ id: 'file-123' }),
      })
    )
  })

  it('should return 404 when file not found', async () => {
    ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(null)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(404)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'File not found' })
  })

  it('should serve file as preview when asset=preview query param', async () => {
    req.query = { id: 'file-123', asset: 'preview' }

    const mockFile = {
      id: 'file-123',
      path: '/files/test.jpg',
      mimeType: 'image/jpeg',
    }

    ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
    ;(fs.existsSync as jest.Mock).mockReturnValue(true)

    const mockReadStream = { pipe: pipeStreamMock }
    ;(fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(setHeaderMock).toHaveBeenCalledWith('Content-Type', 'image/jpeg')
    expect(setHeaderMock).toHaveBeenCalledWith('Cache-Control', 'private, max-age=60')
    expect(pipeStreamMock).toHaveBeenCalledWith(res)
  })

  it('should return 404 when preview file does not exist', async () => {
    req.query = { id: 'file-123', asset: 'preview' }

    const mockFile = {
      id: 'file-123',
      path: '/nonexistent/test.jpg',
      mimeType: 'image/jpeg',
    }

    ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
    ;(fs.existsSync as jest.Mock).mockReturnValue(false)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(404)
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'The file is no longer available. Choose the file again.',
    })
  })

  it('should handle database errors with 500', async () => {
    ;(prisma.creativeFile.findUnique as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(500)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to fetch file' })
  })
})

describe('PATCH /api/files/[id]', () => {
  let req: Partial<NextApiRequest>
  let res: Partial<NextApiResponse>
  let statusMock: jest.Mock
  let jsonMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    statusMock = jest.fn().mockReturnThis()
    jsonMock = jest.fn().mockReturnThis()

    req = {
      method: 'PATCH',
      query: { id: 'file-123' },
      body: {
        type: 'image',
        status: 'Published',
        tags: ['tag1', 'tag2'],
        notes: 'Test notes',
      },
    }

    res = {
      status: statusMock,
      json: jsonMock,
    }
  })

  it('should return 400 when type is empty string', async () => {
    req.body = { type: '', status: 'Published' }

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Please select a file type.',
    })
  })

  it('should return 400 when status is empty string', async () => {
    req.body = { type: 'image', status: '' }

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Status is required.',
    })
  })

  it('should return 400 when tags exceed 20', async () => {
    const tooManyTags = Array.from({ length: 21 }, (_, i) => `tag-${i}`)
    req.body = { type: 'image', status: 'Published', tags: tooManyTags }

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'You can add up to 20 tags.',
    })
  })

  it('should return 400 when notes exceed 500 characters', async () => {
    req.body = {
      type: 'image',
      status: 'Published',
      notes: 'x'.repeat(501),
    }

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Notes can have up to 500 characters.',
    })
  })

  it('should successfully update file metadata', async () => {
    const mockFile = {
      id: 'file-123',
      filename: 'test.jpg',
      type: 'image',
      metadata: { status: 'Published', tags: ['tag1', 'tag2'] },
    }

    ;(prisma.fileMetadata.upsert as jest.Mock).mockResolvedValue({})
    ;(prisma.creativeFile.update as jest.Mock).mockResolvedValue({})
    ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalled()
  })

  it('should return 404 if file disappears after update', async () => {
    ;(prisma.fileMetadata.upsert as jest.Mock).mockResolvedValue({})
    ;(prisma.creativeFile.update as jest.Mock).mockResolvedValue({})
    ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(null)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(404)
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'This item could not be loaded. Refresh and try again.',
    })
  })

  it('should handle update errors with 500', async () => {
    ;(prisma.fileMetadata.upsert as jest.Mock).mockRejectedValue(
      new Error('Update failed')
    )

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(500)
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Failed to save your changes. Try again.',
    })
  })

  it('should allow partial updates', async () => {
    req.body = { type: 'video' } // Only update type

    const mockFile = {
      id: 'file-123',
      filename: 'test.mp4',
      type: 'video',
      metadata: {},
    }

    ;(prisma.fileMetadata.upsert as jest.Mock).mockResolvedValue({})
    ;(prisma.creativeFile.update as jest.Mock).mockResolvedValue({})
    ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
  })
})

describe('Invalid Methods /api/files/[id]', () => {
  let res: Partial<NextApiResponse>
  let statusMock: jest.Mock
  let jsonMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    statusMock = jest.fn().mockReturnThis()
    jsonMock = jest.fn().mockReturnThis()

    res = {
      status: statusMock,
      json: jsonMock,
    }
  })

  it('should return 405 for DELETE', async () => {
    const req: Partial<NextApiRequest> = {
      method: 'DELETE',
      query: { id: 'file-123' },
    }

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(405)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('should return 405 for POST', async () => {
    const req: Partial<NextApiRequest> = {
      method: 'POST',
      query: { id: 'file-123' },
    }

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(405)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })
})
