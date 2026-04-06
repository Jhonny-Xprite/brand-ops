import { NextApiRequest, NextApiResponse } from 'next'
import handler from '../projects/index'
import prisma from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  project: {
    findMany: jest.fn(),
  },
  creativeFile: {
    count: jest.fn(),
  },
}))

jest.mock('@/lib/projectDomain', () => ({
  coerceBusinessModel: jest.fn((model) => model || 'independent'),
}))

describe('GET /api/projects', () => {
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

  it('should return all projects with 200 status', async () => {
    const mockProjects = [
      {
        id: 'proj-1',
        name: 'Project 1',
        niche: 'technology',
        businessModel: 'saas',
        logoFile: null,
        instagramUrl: 'https://instagram.com/proj1',
        youtubeUrl: null,
        facebookUrl: null,
        tiktokUrl: null,
        createdAt: new Date('2024-01-01'),
      },
    ]

    ;(prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects)
    ;(prisma.creativeFile.count as jest.Mock).mockResolvedValue(5)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'proj-1',
          name: 'Project 1',
          niche: 'technology',
        }),
      ])
    )
  })

  it('should calculate asset counts for each project', async () => {
    const mockProjects = [
      {
        id: 'proj-1',
        name: 'Project 1',
        niche: 'tech',
        businessModel: 'saas',
        logoFile: null,
        instagramUrl: null,
        youtubeUrl: null,
        facebookUrl: null,
        tiktokUrl: null,
        createdAt: new Date('2024-01-01'),
      },
    ]

    ;(prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects)
    ;(prisma.creativeFile.count as jest.Mock).mockResolvedValue(3)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(jsonMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          assetCount: 3,
        }),
      ])
    )
  })

  it('should include logo URL when logoFile exists', async () => {
    const mockProjects = [
      {
        id: 'proj-1',
        name: 'Project 1',
        niche: 'tech',
        businessModel: 'saas',
        logoFile: {
          id: 'file-1',
          path: '/files/logo.jpg',
          filename: 'logo.jpg',
        },
        instagramUrl: null,
        youtubeUrl: null,
        facebookUrl: null,
        tiktokUrl: null,
        createdAt: new Date('2024-01-01'),
      },
    ]

    ;(prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects)
    ;(prisma.creativeFile.count as jest.Mock).mockResolvedValue(0)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(jsonMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          logoUrl: '/api/files/file-1?asset=preview',
        }),
      ])
    )
  })

  it('should return undefined logoUrl when logoFile does not exist', async () => {
    const mockProjects = [
      {
        id: 'proj-1',
        name: 'Project 1',
        niche: 'tech',
        businessModel: 'saas',
        logoFile: null,
        instagramUrl: null,
        youtubeUrl: null,
        facebookUrl: null,
        tiktokUrl: null,
        createdAt: new Date('2024-01-01'),
      },
    ]

    ;(prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects)
    ;(prisma.creativeFile.count as jest.Mock).mockResolvedValue(0)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(jsonMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          logoUrl: undefined,
        }),
      ])
    )
  })

  it('should include all social links', async () => {
    const mockProjects = [
      {
        id: 'proj-1',
        name: 'Project 1',
        niche: 'tech',
        businessModel: 'saas',
        logoFile: null,
        instagramUrl: 'https://instagram.com/proj1',
        youtubeUrl: 'https://youtube.com/proj1',
        facebookUrl: 'https://facebook.com/proj1',
        tiktokUrl: 'https://tiktok.com/proj1',
        createdAt: new Date('2024-01-01'),
      },
    ]

    ;(prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects)
    ;(prisma.creativeFile.count as jest.Mock).mockResolvedValue(0)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(jsonMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          socialLinks: {
            instagramUrl: 'https://instagram.com/proj1',
            youtubeUrl: 'https://youtube.com/proj1',
            facebookUrl: 'https://facebook.com/proj1',
            tiktokUrl: 'https://tiktok.com/proj1',
          },
        }),
      ])
    )
  })

  it('should return empty array when no projects exist', async () => {
    ;(prisma.project.findMany as jest.Mock).mockResolvedValue([])

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith([])
  })

  it('should order projects by createdAt descending', async () => {
    ;(prisma.project.findMany as jest.Mock).mockResolvedValue([])

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    )
  })

  it('should handle database errors with 500 status', async () => {
    ;(prisma.project.findMany as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(500)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to fetch projects' })
  })

  it('should return 405 for non-GET requests', async () => {
    req.method = 'POST'

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(405)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('should return ISO string for createdAt timestamp', async () => {
    const testDate = new Date('2024-01-15T10:30:00Z')
    const mockProjects = [
      {
        id: 'proj-1',
        name: 'Project 1',
        niche: 'tech',
        businessModel: 'saas',
        logoFile: null,
        instagramUrl: null,
        youtubeUrl: null,
        facebookUrl: null,
        tiktokUrl: null,
        createdAt: testDate,
      },
    ]

    ;(prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects)
    ;(prisma.creativeFile.count as jest.Mock).mockResolvedValue(0)

    await handler(req as NextApiRequest, res as NextApiResponse)

    expect(jsonMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          createdAt: testDate.toISOString(),
        }),
      ])
    )
  })
})
