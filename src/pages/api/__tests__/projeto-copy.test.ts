import { NextApiRequest, NextApiResponse } from 'next'
import handler from '../projeto/[id]/copy'
import prisma from '@/lib/prisma'
import * as creativeFiles from '@/lib/creativeFiles'
import * as projectWorkspace from '@/lib/projectWorkspace'
import * as fileUtils from '@/lib/fileUtils'
import fs from 'fs'
import path from 'path'

jest.mock('@/lib/prisma', () => ({
  creativeFile: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}))

jest.mock('@/lib/creativeFiles', () => ({
  serializeCreativeFile: jest.fn((file) => ({
    ...file,
    serialized: true,
  })),
}))

jest.mock('@/lib/projectWorkspace', () => ({
  buildWorkspaceTags: jest.fn((id, scope, tags) => [...tags]),
  ensureProjectScopeDirectory: jest.fn((id, scope) => `/storage/${id}/${scope}`),
}))

jest.mock('@/lib/fileUtils', () => ({
  sanitizeFilename: jest.fn((name) => name.replace(/[^a-z0-9.-]/gi, '_')),
}))

jest.mock('fs')
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((dir, file) => `${dir}/${file}`),
}))

describe('GET/POST /api/projeto/[id]/copy', () => {
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

    it('should return 405 for unsupported methods', async () => {
      req.method = 'DELETE'

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(405)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })
  })

  describe('GET - Retrieve copy entries', () => {
    const mockFiles = [
      {
        id: 'file-1',
        filename: '1234567890-main-headline.txt',
        type: 'document',
        mimeType: 'text/plain',
        createdAt: new Date('2026-04-01'),
        updatedAt: new Date('2026-04-05'),
        metadata: {
          tags: ['project-proj-123', 'scope:copy', 'copy-type:headline', 'angle:emotional', 'audience:millennials'],
          status: 'Approved',
          type: 'document',
          notes: 'Inspiring headline for main campaign',
        },
      },
      {
        id: 'file-2',
        filename: '1234567891-call-to-action.txt',
        type: 'document',
        mimeType: 'text/plain',
        createdAt: new Date('2026-04-02'),
        updatedAt: new Date('2026-04-04'),
        metadata: {
          tags: ['project-proj-123', 'scope:copy', 'copy-type:cta', 'angle:rational', 'audience:executives'],
          status: 'Approved',
          type: 'document',
          notes: 'Professional CTA for B2B',
        },
      },
    ]

    beforeEach(() => {
      req.method = 'GET'
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue(mockFiles)
    })

    it('should return 200 with items list', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({
        items: expect.any(Array),
      })
    })

    it('should transform files to copy entries', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      expect(call.items[0]).toMatchObject({
        id: 'file-1',
        title: expect.any(String),
        content: expect.any(String),
        copyType: expect.any(String),
        angle: expect.any(String),
        audience: expect.any(String),
      })
    })

    it('should extract title from filename', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      // Filename format: {timestamp}-{title}.txt
      expect(call.items[0].title).not.toContain('1234567890')
    })

    it('should filter by search in title', async () => {
      req.query = { id: 'proj-123', search: 'headline' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      call.items.forEach((item: any) => {
        expect(
          item.title.toLowerCase().includes('headline') ||
          item.content.toLowerCase().includes('headline')
        ).toBe(true)
      })
    })

    it('should filter by search in content', async () => {
      req.query = { id: 'proj-123', search: 'inspiring' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      if (call.items.length > 0) {
        call.items.forEach((item: any) => {
          expect(
            item.title.toLowerCase().includes('inspiring') ||
            item.content.toLowerCase().includes('inspiring')
          ).toBe(true)
        })
      }
    })

    it('should filter by angle', async () => {
      req.query = { id: 'proj-123', angle: 'emotional' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      call.items.forEach((item: any) => {
        expect(item.angle).toBe('emotional')
      })
    })

    it('should filter by audience', async () => {
      req.query = { id: 'proj-123', audience: 'millennials' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      call.items.forEach((item: any) => {
        expect(item.audience).toBe('millennials')
      })
    })

    it('should handle empty results', async () => {
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue([])

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({ items: [] })
    })

    it('should handle database error', async () => {
      ;(prisma.creativeFile.findMany as jest.Mock).mockRejectedValue(new Error('DB error'))

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to load copy library.' })
    })
  })

  describe('POST - Create copy entry', () => {
    const mockCreatedFile = {
      id: 'file-new',
      filename: '1700000000-new-headline.txt',
      type: 'document',
      mimeType: 'text/plain',
      createdAt: new Date('2026-04-06'),
      updatedAt: new Date('2026-04-06'),
      metadata: {
        tags: ['project-proj-123', 'scope:copy', 'copy-type:headline', 'angle:geral', 'audience:todos'],
        status: 'Approved',
        type: 'document',
        notes: 'New headline content',
      },
    }

    beforeEach(() => {
      req.method = 'POST'
      req.body = {
        title: 'New Headline',
        content: 'New headline content',
        copyType: 'headline',
        angle: 'geral',
        audience: 'todos',
      }
      ;(projectWorkspace.ensureProjectScopeDirectory as jest.Mock).mockReturnValue('/storage/proj-123/copy')
      ;(fs.writeFileSync as jest.Mock).mockImplementation(() => {})
      ;(fs.statSync as jest.Mock).mockReturnValue({ size: 100 })
      ;(prisma.creativeFile.create as jest.Mock).mockResolvedValue(mockCreatedFile)
    })

    it('should return 400 when title is missing', async () => {
      req.body = { content: 'content', copyType: 'headline' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Title and content are required.',
      })
    })

    it('should return 400 when content is missing', async () => {
      req.body = { title: 'Title', copyType: 'headline' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Title and content are required.',
      })
    })

    it('should return 400 when title is whitespace only', async () => {
      req.body = { title: '   ', content: 'content' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
    })

    it('should create copy entry with defaults', async () => {
      req.body = {
        title: 'New Entry',
        content: 'Content here',
      }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(201)
      expect(prisma.creativeFile.create).toHaveBeenCalled()
    })

    it('should sanitize title for filename', async () => {
      req.body = {
        title: 'Special @#$ Chars',
        content: 'content',
      }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(fileUtils.sanitizeFilename).toHaveBeenCalledWith(
        expect.stringContaining('special')
      )
    })

    it('should write file to filesystem', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        'New headline content',
        'utf8'
      )
    })

    it('should create metadata with tags', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(prisma.creativeFile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadata: expect.objectContaining({
              create: expect.objectContaining({
                tags: expect.any(String),
                status: 'Approved',
              }),
            }),
          }),
        })
      )
    })

    it('should return 201 with created entry', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith({
        item: expect.objectContaining({
          id: 'file-new',
          title: expect.any(String),
          content: 'New headline content',
        }),
      })
    })

    it('should handle creation error', async () => {
      ;(prisma.creativeFile.create as jest.Mock).mockRejectedValue(new Error('DB error'))

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Failed to create copy entry.',
      })
    })
  })
})
