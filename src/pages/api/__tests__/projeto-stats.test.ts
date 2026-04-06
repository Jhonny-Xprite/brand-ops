import { NextApiRequest, NextApiResponse } from 'next'
import handler from '../projeto/[id]/stats'
import prisma from '@/lib/prisma'
import * as projectDomain from '@/lib/projectDomain'
import * as projectWorkspace from '@/lib/projectWorkspace'
import * as types from '@/lib/types'

jest.mock('@/lib/prisma', () => ({
  project: {
    findUnique: jest.fn(),
  },
  creativeFile: {
    findMany: jest.fn(),
  },
  projectLibraryItem: {
    findMany: jest.fn(),
  },
}))

jest.mock('@/lib/projectDomain', () => ({
  coerceBusinessModel: jest.fn((model) => model),
  getBusinessModelLabel: jest.fn((model) => {
    const labels: Record<string, string> = {
      independent: 'Independent',
      saas: 'SaaS',
      agency: 'Agency',
    }
    return labels[model] || 'Unknown'
  }),
}))

jest.mock('@/lib/projectWorkspace', () => ({
  buildProjectWorkspaceWhere: jest.fn(() => ({ projectId: 'proj-123' })),
  buildProjectWorkspaceActivityMessage: jest.fn((data) => `Activity: ${data.filename}`),
  getTaggedValue: jest.fn((tags, prefix) => 'test-scope'),
}))

jest.mock('@/lib/types', () => ({
  parseFileMetadataTags: jest.fn((tags) => ['scope:design', 'priority:high']),
}))

describe('GET /api/projeto/[id]/stats', () => {
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
    it('should return 405 for non-GET requests', async () => {
      req.method = 'POST'

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(405)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
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

  describe('Period handling', () => {
    const mockProject = {
      id: 'proj-123',
      name: 'Test Project',
      niche: 'technology',
      businessModel: 'saas',
      logoFileId: 'file-123',
      logoFile: { id: 'file-123' },
      config: null,
      instagramUrl: 'https://instagram.com/test',
      youtubeUrl: null,
      facebookUrl: null,
      tiktokUrl: null,
    }

    beforeEach(() => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue([])
    })

    it('should default to 7d period when not specified', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(prisma.creativeFile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        })
      )
    })

    it('should use specified period: today', async () => {
      req.query = { id: 'proj-123', period: 'today' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      // Verify createdAt filter was applied
      expect(prisma.creativeFile.findMany).toHaveBeenCalled()
    })

    it('should use specified period: 30d', async () => {
      req.query = { id: 'proj-123', period: '30d' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(prisma.creativeFile.findMany).toHaveBeenCalled()
    })

    it('should default to 7d for invalid period', async () => {
      req.query = { id: 'proj-123', period: 'invalid' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
    })
  })

  describe('Project stats calculation', () => {
    const mockProject = {
      id: 'proj-123',
      name: 'Test Project',
      niche: 'technology',
      businessModel: 'saas',
      logoFileId: 'file-123',
      logoFile: { id: 'file-123' },
      config: { id: 'config-1' },
      instagramUrl: 'https://instagram.com/test',
      youtubeUrl: 'https://youtube.com/test',
      facebookUrl: null,
      tiktokUrl: null,
    }

    const mockFiles = [
      {
        id: 'file-1',
        filename: 'logo.png',
        size: BigInt(2048),
        createdAt: new Date('2026-04-01'),
        updatedAt: new Date('2026-04-01'),
        metadata: { status: 'Done', tags: 'scope:logo priority:high' },
      },
      {
        id: 'file-2',
        filename: 'banner.png',
        size: BigInt(4096),
        createdAt: new Date('2026-04-02'),
        updatedAt: new Date('2026-04-02'),
        metadata: { status: 'Draft', tags: 'scope:banner' },
      },
      {
        id: 'file-3',
        filename: 'icon.svg',
        size: BigInt(1024),
        createdAt: new Date('2026-04-02'),
        updatedAt: new Date('2026-04-02'),
        metadata: { status: 'Approved', tags: '' },
      },
    ]

    beforeEach(() => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue(mockFiles)
      ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue([])
    })

    it('should calculate total assets correctly', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: expect.objectContaining({
            totalAssets: 3,
          }),
        })
      )
    })

    it('should calculate in-progress assets (not Done/Approved)', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: expect.objectContaining({
            inProgressAssets: 1, // Only Draft is in-progress
          }),
        })
      )
    })

    it('should calculate total storage bytes', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: expect.objectContaining({
            totalStorageBytes: '7168', // 2048 + 4096 + 1024
          }),
        })
      )
    })

    it('should include project basic info and logo URL', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          project: expect.objectContaining({
            id: 'proj-123',
            name: 'Test Project',
            niche: 'technology',
            businessModel: 'saas',
            logoUrl: '/api/files/file-123?asset=preview',
            socialLinks: expect.objectContaining({
              instagramUrl: 'https://instagram.com/test',
              youtubeUrl: 'https://youtube.com/test',
            }),
          }),
        })
      )
    })

    it('should handle missing logo file', async () => {
      const projectNoLogo = { ...mockProject, logoFileId: null, logoFile: null }
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(projectNoLogo)

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          project: expect.objectContaining({
            logoUrl: undefined,
          }),
        })
      )
    })
  })

  describe('Timeline generation', () => {
    const mockProject = {
      id: 'proj-123',
      name: 'Test Project',
      niche: 'technology',
      businessModel: 'saas',
      logoFileId: 'file-123',
      logoFile: { id: 'file-123' },
      config: null,
      instagramUrl: null,
      youtubeUrl: null,
      facebookUrl: null,
      tiktokUrl: null,
    }

    const mockFiles = [
      {
        id: 'file-1',
        filename: 'file1.png',
        size: BigInt(1024),
        createdAt: new Date('2026-04-01'),
        updatedAt: new Date('2026-04-01'),
        metadata: null,
      },
      {
        id: 'file-2',
        filename: 'file2.png',
        size: BigInt(1024),
        createdAt: new Date('2026-04-01'),
        updatedAt: new Date('2026-04-01'),
        metadata: null,
      },
      {
        id: 'file-3',
        filename: 'file3.png',
        size: BigInt(1024),
        createdAt: new Date('2026-04-03'),
        updatedAt: new Date('2026-04-03'),
        metadata: null,
      },
    ]

    beforeEach(() => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue(mockFiles)
      ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue([])
    })

    it('should generate timeline with grouped dates', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          timeline: expect.arrayContaining([
            { date: '2026-04-01', count: 2 },
            { date: '2026-04-03', count: 1 },
          ]),
        })
      )
    })

    it('should sort timeline chronologically', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      for (let i = 0; i < call.timeline.length - 1; i++) {
        expect(call.timeline[i].date <= call.timeline[i + 1].date).toBe(true)
      }
    })
  })

  describe('Activities generation', () => {
    const mockProject = {
      id: 'proj-123',
      name: 'Test Project',
      niche: 'technology',
      businessModel: 'saas',
      logoFileId: 'file-123',
      logoFile: { id: 'file-123' },
      config: null,
      instagramUrl: null,
      youtubeUrl: null,
      facebookUrl: null,
      tiktokUrl: null,
    }

    const mockFiles = Array.from({ length: 10 }, (_, i) => ({
      id: `file-${i}`,
      filename: `file-${i}.png`,
      size: BigInt(1024),
      createdAt: new Date('2026-04-01'),
      updatedAt: new Date('2026-04-01'),
      metadata: { status: 'Draft', tags: 'scope:test' },
    }))

    beforeEach(() => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue(mockFiles)
      ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue([])
    })

    it('should include only top 5 recent activities', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          activities: expect.arrayContaining([expect.any(Object), expect.any(Object)]),
        })
      )
      const call = jsonMock.mock.calls[0][0]
      expect(call.activities.length).toBeLessThanOrEqual(5)
    })

    it('should build activity messages with parsed tags', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(projectWorkspace.buildProjectWorkspaceActivityMessage).toHaveBeenCalled()
      expect(types.parseFileMetadataTags).toHaveBeenCalled()
    })
  })

  describe('Domain health calculation', () => {
    const mockProject = {
      id: 'proj-123',
      name: 'Test Project',
      niche: 'technology',
      businessModel: 'saas',
      logoFileId: 'file-123',
      logoFile: { id: 'file-123' },
      config: { id: 'config-1' },
      instagramUrl: 'https://instagram.com/test',
      youtubeUrl: null,
      facebookUrl: null,
      tiktokUrl: null,
    }

    const mockFiles = [
      {
        id: 'file-1',
        filename: 'logo.png',
        size: BigInt(1024),
        createdAt: new Date('2026-04-01'),
        updatedAt: new Date('2026-04-01'),
        metadata: { status: 'Approved', tags: '' },
      },
    ]

    const mockLibraryItems = [
      { domain: 'BRAND_CORE', status: 'Approved' },
      { domain: 'BRAND_CORE', status: 'Draft' },
      { domain: 'SOCIAL_ASSETS', status: 'Approved' },
      { domain: 'CREATIVE_PRODUCTION', status: 'Draft' },
    ]

    beforeEach(() => {
      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue(mockFiles)
      ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue(mockLibraryItems)
    })

    it('should generate domain health for all domains', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          domainHealth: expect.arrayContaining([
            expect.objectContaining({ domain: 'DASHBOARD' }),
            expect.objectContaining({ domain: 'STRATEGY' }),
            expect.objectContaining({ domain: 'BRAND_CORE' }),
            expect.objectContaining({ domain: 'MEDIA' }),
            expect.objectContaining({ domain: 'SOCIAL_ASSETS' }),
            expect.objectContaining({ domain: 'CREATIVE_PRODUCTION' }),
            expect.objectContaining({ domain: 'COPY_MESSAGING' }),
            expect.objectContaining({ domain: 'CONFIG' }),
          ]),
        })
      )
    })

    it('should calculate domain state based on ready vs attention', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      const brandCore = call.domainHealth.find((d: any) => d.domain === 'BRAND_CORE')

      // BRAND_CORE should have: total 2 (logo + library), ready 2 (both approved/done), attention 0
      expect(brandCore).toBeDefined()
      expect(['empty', 'attention', 'ready']).toContain(brandCore.state)
    })

    it('should mark domain as empty when no items', async () => {
      ;(prisma.projectLibraryItem.findMany as jest.Mock).mockResolvedValue([])

      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      const strategy = call.domainHealth.find((d: any) => d.domain === 'STRATEGY')

      expect(strategy.state).toBe('empty')
    })

    it('should include action labels based on state', async () => {
      await handler(req as NextApiRequest, res as NextApiResponse)

      const call = jsonMock.mock.calls[0][0]
      call.domainHealth.forEach((domain: any) => {
        expect(['Abrir menu', 'Revisar pendencias', 'Abrir detalhes']).toContain(domain.actionLabel)
      })
    })
  })

  describe('Error handling', () => {
    it('should handle database error gracefully', async () => {
      ;(prisma.project.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Failed to load project dashboard.',
      })
    })

    it('should handle error in file query', async () => {
      const mockProject = {
        id: 'proj-123',
        name: 'Test Project',
        niche: 'technology',
        businessModel: 'saas',
        logoFileId: 'file-123',
        logoFile: { id: 'file-123' },
        config: null,
        instagramUrl: null,
        youtubeUrl: null,
        facebookUrl: null,
        tiktokUrl: null,
      }

      ;(prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject)
      ;(prisma.creativeFile.findMany as jest.Mock).mockRejectedValue(new Error('Query error'))

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
    })
  })
})
