import type { NextApiRequest, NextApiResponse } from 'next'

import {
  coerceBrandTone,
  coerceClientBrandMode,
  coerceSurfaceStyle,
  coerceVisualDensity,
  type BrandTone,
  type ClientBrandMode,
  type SurfaceStyle,
  type VisualDensity,
} from '@/lib/projectDomain'
import prisma from '@/lib/prisma'

interface BrandCoreResponse {
  projectId: string
  projectName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  neutralBase: string
  titleFont: string
  bodyFont: string
  clientBrandMode: ClientBrandMode
  surfaceStyle: SurfaceStyle
  visualDensity: VisualDensity
  brandTone: BrandTone
  logoFileId?: string
  iconFileId?: string
  symbolFileId?: string
  wordmarkFileId?: string
  logoPreviewUrl?: string
  iconPreviewUrl?: string
  symbolPreviewUrl?: string
  wordmarkPreviewUrl?: string
  createdAt: string
  updatedAt: string
}

interface ErrorResponse {
  error: string
}

function toPreviewUrl(fileId?: string | null) {
  return fileId ? `/api/files/${fileId}?asset=preview` : undefined
}

function defaultCreatePayload(projectId: string) {
  return {
    projectId,
    primaryColor: '#A855F7',
    secondaryColor: '#F0B34F',
    accentColor: '#F97316',
    neutralBase: '#1A1427',
    titleFont: 'Sora',
    bodyFont: 'Inter',
    clientBrandMode: 'FULL_SHELL',
    surfaceStyle: 'AURORA',
    visualDensity: 'BALANCED',
    brandTone: 'LUXURY_STRATEGIC',
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BrandCoreResponse | ErrorResponse>,
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
    try {
      let config = await prisma.projectConfig.findUnique({
        where: { projectId },
      })

      if (!config) {
        config = await prisma.projectConfig.create({
          data: defaultCreatePayload(projectId),
        })
      }

      return res.status(200).json({
        projectId: project.id,
        projectName: project.name,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        accentColor: config.accentColor,
        neutralBase: config.neutralBase,
        titleFont: config.titleFont,
        bodyFont: config.bodyFont,
        clientBrandMode: coerceClientBrandMode(config.clientBrandMode),
        surfaceStyle: coerceSurfaceStyle(config.surfaceStyle),
        visualDensity: coerceVisualDensity(config.visualDensity),
        brandTone: coerceBrandTone(config.brandTone),
        logoFileId: config.logoFileId || undefined,
        iconFileId: config.iconFileId || undefined,
        symbolFileId: config.symbolFileId || undefined,
        wordmarkFileId: config.wordmarkFileId || undefined,
        logoPreviewUrl: toPreviewUrl(config.logoFileId),
        iconPreviewUrl: toPreviewUrl(config.iconFileId),
        symbolPreviewUrl: toPreviewUrl(config.symbolFileId),
        wordmarkPreviewUrl: toPreviewUrl(config.wordmarkFileId),
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString(),
      })
    } catch (error) {
      console.error('Failed to fetch brand core:', error)
      return res.status(500).json({ error: 'Failed to fetch brand core' })
    }
  }

  if (req.method === 'POST') {
    const {
      primaryColor,
      secondaryColor,
      accentColor,
      neutralBase,
      titleFont,
      bodyFont,
      clientBrandMode,
      surfaceStyle,
      visualDensity,
      brandTone,
      logoFileId,
      iconFileId,
      symbolFileId,
      wordmarkFileId,
    } = req.body as {
      primaryColor?: string
      secondaryColor?: string
      accentColor?: string
      neutralBase?: string
      titleFont?: string
      bodyFont?: string
      clientBrandMode?: string
      surfaceStyle?: string
      visualDensity?: string
      brandTone?: string
      logoFileId?: string
      iconFileId?: string
      symbolFileId?: string
      wordmarkFileId?: string
    }

    const hexRegex = /^#[0-9A-F]{6}$/i
    for (const value of [primaryColor, secondaryColor, accentColor, neutralBase]) {
      if (value && !hexRegex.test(value)) {
        return res.status(400).json({ error: 'Invalid color format' })
      }
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const config = await tx.projectConfig.upsert({
          where: { projectId },
          update: {
            primaryColor: primaryColor || undefined,
            secondaryColor: secondaryColor || undefined,
            accentColor: accentColor || undefined,
            neutralBase: neutralBase || undefined,
            titleFont: titleFont || undefined,
            bodyFont: bodyFont || undefined,
            clientBrandMode: clientBrandMode ? coerceClientBrandMode(clientBrandMode) : undefined,
            surfaceStyle: surfaceStyle ? coerceSurfaceStyle(surfaceStyle) : undefined,
            visualDensity: visualDensity ? coerceVisualDensity(visualDensity) : undefined,
            brandTone: brandTone ? coerceBrandTone(brandTone) : undefined,
            logoFileId: logoFileId || undefined,
            iconFileId: iconFileId || undefined,
            symbolFileId: symbolFileId || undefined,
            wordmarkFileId: wordmarkFileId || undefined,
          },
          create: {
            ...defaultCreatePayload(projectId),
            primaryColor: primaryColor || '#A855F7',
            secondaryColor: secondaryColor || '#F0B34F',
            accentColor: accentColor || '#F97316',
            neutralBase: neutralBase || '#1A1427',
            titleFont: titleFont || 'Sora',
            bodyFont: bodyFont || 'Inter',
            clientBrandMode: clientBrandMode ? coerceClientBrandMode(clientBrandMode) : 'FULL_SHELL',
            surfaceStyle: surfaceStyle ? coerceSurfaceStyle(surfaceStyle) : 'AURORA',
            visualDensity: visualDensity ? coerceVisualDensity(visualDensity) : 'BALANCED',
            brandTone: brandTone ? coerceBrandTone(brandTone) : 'LUXURY_STRATEGIC',
            logoFileId: logoFileId || undefined,
            iconFileId: iconFileId || undefined,
            symbolFileId: symbolFileId || undefined,
            wordmarkFileId: wordmarkFileId || undefined,
          },
        })

        if (logoFileId) {
          await tx.project.update({
            where: { id: projectId },
            data: { logoFileId },
          })
        }

        const currentProject = await tx.project.findUniqueOrThrow({
          where: { id: projectId },
        })

        return { config, project: currentProject }
      })

      return res.status(200).json({
        projectId: result.project.id,
        projectName: result.project.name,
        primaryColor: result.config.primaryColor,
        secondaryColor: result.config.secondaryColor,
        accentColor: result.config.accentColor,
        neutralBase: result.config.neutralBase,
        titleFont: result.config.titleFont,
        bodyFont: result.config.bodyFont,
        clientBrandMode: coerceClientBrandMode(result.config.clientBrandMode),
        surfaceStyle: coerceSurfaceStyle(result.config.surfaceStyle),
        visualDensity: coerceVisualDensity(result.config.visualDensity),
        brandTone: coerceBrandTone(result.config.brandTone),
        logoFileId: result.config.logoFileId || undefined,
        iconFileId: result.config.iconFileId || undefined,
        symbolFileId: result.config.symbolFileId || undefined,
        wordmarkFileId: result.config.wordmarkFileId || undefined,
        logoPreviewUrl: toPreviewUrl(result.config.logoFileId),
        iconPreviewUrl: toPreviewUrl(result.config.iconFileId),
        symbolPreviewUrl: toPreviewUrl(result.config.symbolFileId),
        wordmarkPreviewUrl: toPreviewUrl(result.config.wordmarkFileId),
        createdAt: result.config.createdAt.toISOString(),
        updatedAt: result.config.updatedAt.toISOString(),
      })
    } catch (error) {
      console.error('Failed to save brand core:', error)
      return res.status(500).json({ error: 'Failed to save brand core' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
