import type { NextApiRequest, NextApiResponse } from 'next'

import { coerceBusinessModel, isBusinessModel, type ProjectBusinessModel } from '@/lib/projectDomain'
import prisma from '@/lib/prisma'

interface ConfigResponse {
  projectId: string
  projectName: string
  niche: string
  businessModel: ProjectBusinessModel
  instagramUrl?: string
  youtubeUrl?: string
  facebookUrl?: string
  tiktokUrl?: string
  createdAt: string
  updatedAt: string
}

interface ErrorResponse {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfigResponse | ErrorResponse>,
) {
  const { id: projectId } = req.query

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' })
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    return res.status(404).json({ error: 'Project not found' })
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      projectId: project.id,
      projectName: project.name,
      niche: project.niche,
      businessModel: coerceBusinessModel(project.businessModel),
      instagramUrl: project.instagramUrl || undefined,
      youtubeUrl: project.youtubeUrl || undefined,
      facebookUrl: project.facebookUrl || undefined,
      tiktokUrl: project.tiktokUrl || undefined,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    })
  }

  if (req.method === 'POST') {
    const {
      projectName,
      niche,
      businessModel,
      instagramUrl,
      youtubeUrl,
      facebookUrl,
      tiktokUrl,
    } = req.body as {
      projectName?: string
      niche?: string
      businessModel?: string
      instagramUrl?: string
      youtubeUrl?: string
      facebookUrl?: string
      tiktokUrl?: string
    }

    if (!projectName?.trim() || projectName.trim().length < 3 || projectName.trim().length > 50) {
      return res.status(400).json({ error: 'Project name must be between 3 and 50 characters' })
    }

    if (!niche?.trim() || niche.trim().length < 2 || niche.trim().length > 60) {
      return res.status(400).json({ error: 'Niche must be between 2 and 60 characters' })
    }

    if (!businessModel || !isBusinessModel(businessModel)) {
      return res.status(400).json({ error: 'Invalid business model' })
    }

    try {
      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: {
          name: projectName.trim(),
          niche: niche.trim(),
          businessModel,
          instagramUrl: instagramUrl?.trim() || null,
          youtubeUrl: youtubeUrl?.trim() || null,
          facebookUrl: facebookUrl?.trim() || null,
          tiktokUrl: tiktokUrl?.trim() || null,
        },
      })

      return res.status(200).json({
        projectId: updatedProject.id,
        projectName: updatedProject.name,
        niche: updatedProject.niche,
        businessModel: coerceBusinessModel(updatedProject.businessModel),
        instagramUrl: updatedProject.instagramUrl || undefined,
        youtubeUrl: updatedProject.youtubeUrl || undefined,
        facebookUrl: updatedProject.facebookUrl || undefined,
        tiktokUrl: updatedProject.tiktokUrl || undefined,
        createdAt: updatedProject.createdAt.toISOString(),
        updatedAt: updatedProject.updatedAt.toISOString(),
      })
    } catch (error) {
      console.error('Failed to save project config:', error)
      return res.status(500).json({ error: 'Failed to save configuration' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
