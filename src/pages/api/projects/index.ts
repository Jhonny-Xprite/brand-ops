import { NextApiRequest, NextApiResponse } from 'next'
import { coerceBusinessModel, type ProjectBusinessModel } from '@/lib/projectDomain'
import prisma from '@/lib/prisma'

interface ProjectResponse {
  id: string
  name: string
  niche: string
  businessModel: ProjectBusinessModel
  logoUrl?: string
  assetCount: number
  createdAt: string
  socialLinks: {
    instagramUrl?: string
    youtubeUrl?: string
    facebookUrl?: string
    tiktokUrl?: string
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProjectResponse[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const projects = await prisma.project.findMany({
      include: {
        logoFile: {
          select: {
            id: true,
            path: true,
            filename: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get asset counts for each project
    const projectAssetCounts = await Promise.all(
      projects.map(async (project) => {
        // Count CreativeFiles that have tags referencing this project
        const count = await prisma.creativeFile.count({
          where: {
            metadata: {
              tags: {
                contains: `project-${project.id}`,
              },
            },
          },
        })
        return { projectId: project.id, count }
      })
    )

    const assetCountMap = new Map(projectAssetCounts.map((item) => [item.projectId, item.count]))

    // Transform projects to response format
    const projectsResponse: ProjectResponse[] = projects.map((project) => ({
      id: project.id,
      name: project.name,
      niche: project.niche,
      businessModel: coerceBusinessModel(project.businessModel),
      logoUrl: project.logoFile?.id ? `/api/files/${project.logoFile.id}?asset=preview` : undefined,
      assetCount: assetCountMap.get(project.id) || 0,
      createdAt: project.createdAt.toISOString(),
      socialLinks: {
        instagramUrl: project.instagramUrl || undefined,
        youtubeUrl: project.youtubeUrl || undefined,
        facebookUrl: project.facebookUrl || undefined,
        tiktokUrl: project.tiktokUrl || undefined,
      },
    }))

    return res.status(200).json(projectsResponse)
  } catch (error) {
    console.error('Fetch Projects Error:', error)
    return res.status(500).json({ error: 'Failed to fetch projects' })
  }
}
