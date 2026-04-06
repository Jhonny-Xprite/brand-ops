import { NextApiRequest, NextApiResponse } from 'next'
import handler from '../projeto/[id]/config'
import prisma from '@/lib/prisma'
import * as projectDomain from '@/lib/projectDomain'

jest.mock('@/lib/prisma', () => ({
  project: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}))

jest.mock('@/lib/projectDomain', () => ({
  coerceBusinessModel: jest.fn((model) => model),
  isBusinessModel: jest.fn((model) => ['independent', 'saas', 'agency'].includes(model)),
}))

describe('GET/POST /api/projeto/[id]/config', () => {
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
    it('should return 400 when project ID is missing', async () => {
      req.query = {}

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid project ID' })
    })

    it('should return 400 when project ID is not a string', async () => {
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
  })

  describe('GET - Retrieve config', () => {
    const mockProject = {
      id: 'proj-123',
      name: 'Test Project',
      niche: 'technology',
      businessModel: 'saas',
      instagramUrl: 'https://instagram.com/test',
      youtubeUrl: 'https://youtube.com/test',
      facebookUrl: null,
      tiktokUrl: null,
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date('2026-04-05T14:30:00Z'),
    }

    beforeEach(() => {
      req.method = 'GET'
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
    })

    it('should return 200 with project config', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'proj-123',
          projectName: 'Test Project',
          niche: 'technology',
          businessModel: 'saas',
        })
      )
    })

    it('should include social links when present', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          instagramUrl: 'https://instagram.com/test',
          youtubeUrl: 'https://youtube.com/test',
        })
      )
    })

    it('should omit null social links (undefined)', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      expect(call.facebookUrl).toBeUndefined()
      expect(call.tiktokUrl).toBeUndefined()
    })

    it('should include createdAt and updatedAt as ISO strings', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: '2026-04-01T10:00:00.000Z',
          updatedAt: '2026-04-05T14:30:00.000Z',
        })
      )
    })

    it('should coerce business model', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(projectDomain.coerceBusinessModel).toHaveBeenCalledWith('saas')
    })
  })

  describe('POST - Update config', () => {
    const mockProject = {
      id: 'proj-123',
      name: 'Test Project',
      niche: 'technology',
      businessModel: 'saas',
      instagramUrl: null,
      youtubeUrl: null,
      facebookUrl: null,
      tiktokUrl: null,
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date('2026-04-05T14:30:00Z'),
    }

    const mockUpdatedProject = {
      ...mockProject,
      name: 'Updated Project',
      niche: 'fintech',
      businessModel: 'saas',
      instagramUrl: 'https://instagram.com/updated',
      youtubeUrl: 'https://youtube.com/updated',
    }

    beforeEach(() => {
      req.method = 'POST'
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
    })

    it('should return 400 when projectName is missing', async () => {
      req.body = { niche: 'tech', businessModel: 'saas' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Project name must be between 3 and 50 characters',
      })
    })

    it('should return 400 when projectName is too short', async () => {
      req.body = { projectName: 'ab', niche: 'tech', businessModel: 'saas' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Project name must be between 3 and 50 characters',
      })
    })

    it('should return 400 when projectName is too long', async () => {
      req.body = {
        projectName: 'a'.repeat(51),
        niche: 'tech',
        businessModel: 'saas',
      }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Project name must be between 3 and 50 characters',
      })
    })

    it('should return 400 when projectName is whitespace only', async () => {
      req.body = { projectName: '   ', niche: 'tech', businessModel: 'saas' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
    })

    it('should return 400 when niche is missing', async () => {
      req.body = { projectName: 'Test', businessModel: 'saas' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Niche must be between 2 and 60 characters',
      })
    })

    it('should return 400 when niche is too short', async () => {
      req.body = { projectName: 'Test', niche: 'a', businessModel: 'saas' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Niche must be between 2 and 60 characters',
      })
    })

    it('should return 400 when niche is too long', async () => {
      req.body = {
        projectName: 'Test',
        niche: 'a'.repeat(61),
        businessModel: 'saas',
      }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Niche must be between 2 and 60 characters',
      })
    })

    it('should return 400 when businessModel is invalid', async () => {
      req.body = {
        projectName: 'Test',
        niche: 'tech',
        businessModel: 'invalid',
      }

      ;(projectDomain.isBusinessModel as jest.Mock).mockReturnValue(false)

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid business model',
      })
    })

    it('should return 400 when businessModel is missing', async () => {
      req.body = { projectName: 'Test', niche: 'tech' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid business model',
      })
    })

    it('should update project successfully', async () => {
      req.body = {
        projectName: 'Updated Project',
        niche: 'fintech',
        businessModel: 'saas',
        instagramUrl: 'https://instagram.com/updated',
        youtubeUrl: 'https://youtube.com/updated',
      }

      ;(projectDomain.isBusinessModel as jest.Mock).mockReturnValue(true)
      ;(prisma.project.update as jest.Mock).mockResolvedValue(mockUpdatedProject)

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj-123' },
        data: {
          name: 'Updated Project',
          niche: 'fintech',
          businessModel: 'saas',
          instagramUrl: 'https://instagram.com/updated',
          youtubeUrl: 'https://youtube.com/updated',
          facebookUrl: null,
          tiktokUrl: null,
        },
      })
    })

    it('should trim whitespace from input fields', async () => {
      req.body = {
        projectName: '  Updated Project  ',
        niche: '  fintech  ',
        businessModel: 'saas',
        instagramUrl: '  https://instagram.com/updated  ',
      }

      ;(projectDomain.isBusinessModel as jest.Mock).mockReturnValue(true)
      ;(prisma.project.update as jest.Mock).mockResolvedValue(mockUpdatedProject)

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj-123' },
        data: expect.objectContaining({
          name: 'Updated Project',
          niche: 'fintech',
          instagramUrl: 'https://instagram.com/updated',
        }),
      })
    })

    it('should convert empty string social links to null', async () => {
      req.body = {
        projectName: 'Test',
        niche: 'tech',
        businessModel: 'saas',
        instagramUrl: '',
        youtubeUrl: '',
      }

      ;(projectDomain.isBusinessModel as jest.Mock).mockReturnValue(true)
      ;(prisma.project.update as jest.Mock).mockResolvedValue(mockUpdatedProject)

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj-123' },
        data: expect.objectContaining({
          instagramUrl: null,
          youtubeUrl: null,
        }),
      })
    })

    it('should return updated config on success', async () => {
      req.body = {
        projectName: 'Updated',
        niche: 'fintech',
        businessModel: 'saas',
      }

      ;(projectDomain.isBusinessModel as jest.Mock).mockReturnValue(true)
      ;(prisma.project.update as jest.Mock).mockResolvedValue(mockUpdatedProject)

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'proj-123',
          projectName: 'Updated Project',
          niche: 'fintech',
        })
      )
    })

    it('should handle database error gracefully', async () => {
      req.body = {
        projectName: 'Test',
        niche: 'tech',
        businessModel: 'saas',
      }

      ;(projectDomain.isBusinessModel as jest.Mock).mockReturnValue(true)
      ;(prisma.project.update as jest.Mock).mockRejectedValue(new Error('DB error'))

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Failed to save configuration',
      })
    })
  })

  describe('Method validation', () => {
    const mockProject = {
      id: 'proj-123',
      name: 'Test',
      niche: 'tech',
      businessModel: 'saas',
      instagramUrl: null,
      youtubeUrl: null,
      facebookUrl: null,
      tiktokUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    beforeEach(() => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
    })

    it('should return 405 for DELETE', async () => {
      req.method = 'DELETE'

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(405)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })

    it('should return 405 for PATCH', async () => {
      req.method = 'PATCH'

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(405)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })

    it('should return 405 for PUT', async () => {
      req.method = 'PUT'

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(405)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })
  })
})
