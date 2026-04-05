import type { NextApiRequest, NextApiResponse } from 'next'

import { coerceBusinessModel, getBusinessModelLabel } from '@/lib/projectDomain'
import prisma from '@/lib/prisma'
import { buildProjectWorkspaceActivityMessage, buildProjectWorkspaceWhere, getTaggedValue } from '@/lib/projectWorkspace'
import { parseFileMetadataTags } from '@/lib/types'

interface StatsResponse {
  project: {
    id: string
    name: string
    niche: string
    businessModel: string
    businessModelLabel: string
    logoUrl?: string
    socialLinks: {
      instagramUrl?: string
      youtubeUrl?: string
      facebookUrl?: string
      tiktokUrl?: string
    }
  }
  summary: {
    totalAssets: number
    inProgressAssets: number
    totalStorageBytes: string
  }
  timeline: Array<{
    date: string
    count: number
  }>
  activities: Array<{
    id: string
    message: string
    updatedAt: string
  }>
  domainHealth: Array<{
    domain: string
    label: string
    total: number
    ready: number
    attention: number
    href: string
    actionLabel: string
    state: 'empty' | 'attention' | 'ready'
  }>
}

function resolvePeriodRange(period: string): Date {
  const now = new Date()

  if (period === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }

  if (period === '30d') {
    return new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
  }

  return new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsResponse | { error: string }>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' })
  }

  const period = typeof req.query.period === 'string' ? req.query.period : '7d'
  const rangeStart = resolvePeriodRange(period)

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        logoFile: {
          select: {
            id: true,
          },
        },
        config: true,
      },
    })

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const files = await prisma.creativeFile.findMany({
      where: {
        ...buildProjectWorkspaceWhere(id, 'all'),
        createdAt: {
          gte: rangeStart,
        },
      },
      include: {
        metadata: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    const totalStorageBytes = files.reduce((sum, file) => sum + file.size, BigInt(0))
    const inProgressAssets = files.filter((file) => {
      const status = file.metadata?.status ?? 'Draft'
      return status !== 'Done' && status !== 'Approved'
    }).length

    const timelineMap = new Map<string, number>()

    files.forEach((file) => {
      const key = file.createdAt.toISOString().slice(0, 10)
      timelineMap.set(key, (timelineMap.get(key) ?? 0) + 1)
    })

    const timeline = Array.from(timelineMap.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, count]) => ({ date, count }))

    const activities = files.slice(0, 5).map((file) => {
      const tags = file.metadata ? parseFileMetadataTags(file.metadata.tags) : []
      const scope = getTaggedValue(tags, 'scope:')

      return {
        id: file.id,
        message: buildProjectWorkspaceActivityMessage({
          filename: file.filename,
          scope,
          status: file.metadata?.status ?? null,
        }),
        updatedAt: file.updatedAt.toISOString(),
      }
    })

    const libraryItems = await prisma.projectLibraryItem.findMany({
      where: { projectId: id },
      select: {
        domain: true,
        status: true,
      },
    })

    const libraryStats = libraryItems.reduce<Record<string, { total: number; ready: number }>>((acc, item) => {
      const bucket = acc[item.domain] ?? { total: 0, ready: 0 }
      bucket.total += 1
      if (item.status === 'Approved' || item.status === 'Done') {
        bucket.ready += 1
      }
      acc[item.domain] = bucket
      return acc
    }, {})

    const domainHealth: StatsResponse['domainHealth'] = [
      {
        domain: 'DASHBOARD',
        label: 'Command Center',
        total: 1,
        ready: project.config ? 1 : 0,
        attention: project.config ? 0 : 1,
        href: `/projeto/${id}/dashboard`,
      },
      {
        domain: 'STRATEGY',
        label: 'Strategy',
        total: libraryStats.STRATEGY?.total ?? 0,
        ready: libraryStats.STRATEGY?.ready ?? 0,
        attention: Math.max((libraryStats.STRATEGY?.total ?? 0) - (libraryStats.STRATEGY?.ready ?? 0), 0),
        href: `/projeto/${id}/strategy`,
      },
      {
        domain: 'BRAND_CORE',
        label: 'Brand Core',
        total: (libraryStats.BRAND_CORE?.total ?? 0) + (project.config ? 1 : 0),
        ready: project.logoFileId ? 1 : 0,
        attention: project.logoFileId ? 0 : 1,
        href: `/projeto/${id}/brand-core`,
      },
      {
        domain: 'MEDIA',
        label: 'Media Library',
        total: files.length,
        ready: files.filter((file) => {
          const status = file.metadata?.status ?? 'Draft'
          return status === 'Approved' || status === 'Done'
        }).length,
        attention: files.filter((file) => {
          const status = file.metadata?.status ?? 'Draft'
          return status !== 'Approved' && status !== 'Done'
        }).length,
        href: `/projeto/${id}/media`,
      },
      {
        domain: 'SOCIAL_ASSETS',
        label: 'Social Assets',
        total: libraryStats.SOCIAL_ASSETS?.total ?? 0,
        ready: libraryStats.SOCIAL_ASSETS?.ready ?? 0,
        attention: Math.max((libraryStats.SOCIAL_ASSETS?.total ?? 0) - (libraryStats.SOCIAL_ASSETS?.ready ?? 0), 0),
        href: `/projeto/${id}/social`,
      },
      {
        domain: 'CREATIVE_PRODUCTION',
        label: 'Creative Production',
        total: libraryStats.CREATIVE_PRODUCTION?.total ?? 0,
        ready: libraryStats.CREATIVE_PRODUCTION?.ready ?? 0,
        attention: Math.max((libraryStats.CREATIVE_PRODUCTION?.total ?? 0) - (libraryStats.CREATIVE_PRODUCTION?.ready ?? 0), 0),
        href: `/projeto/${id}/production`,
      },
      {
        domain: 'COPY_MESSAGING',
        label: 'Copy & Messaging',
        total: libraryStats.COPY_MESSAGING?.total ?? 0,
        ready: libraryStats.COPY_MESSAGING?.ready ?? 0,
        attention: Math.max((libraryStats.COPY_MESSAGING?.total ?? 0) - (libraryStats.COPY_MESSAGING?.ready ?? 0), 0),
        href: `/projeto/${id}/copy`,
      },
      {
        domain: 'CONFIG',
        label: 'Configs',
        total: 1,
        ready:
          project.name && project.niche && project.businessModel && (project.instagramUrl || project.youtubeUrl || project.facebookUrl || project.tiktokUrl)
            ? 1
            : 0,
        attention:
          project.name && project.niche && project.businessModel && (project.instagramUrl || project.youtubeUrl || project.facebookUrl || project.tiktokUrl)
            ? 0
            : 1,
        href: `/projeto/${id}/config`,
      },
    ].map((entry) => {
      const state: 'empty' | 'attention' | 'ready' =
        entry.total === 0 ? 'empty' : entry.attention > 0 ? 'attention' : 'ready'

      return {
        ...entry,
        state,
        actionLabel: state === 'empty' ? 'Abrir menu' : state === 'attention' ? 'Revisar pendencias' : 'Abrir detalhes',
      }
    })

    return res.status(200).json({
      project: {
        id: project.id,
        name: project.name,
        niche: project.niche,
        businessModel: coerceBusinessModel(project.businessModel),
        businessModelLabel: getBusinessModelLabel(coerceBusinessModel(project.businessModel)),
        logoUrl: project.logoFile?.id ? `/api/files/${project.logoFile.id}?asset=preview` : undefined,
        socialLinks: {
          instagramUrl: project.instagramUrl || undefined,
          youtubeUrl: project.youtubeUrl || undefined,
          facebookUrl: project.facebookUrl || undefined,
          tiktokUrl: project.tiktokUrl || undefined,
        },
      },
      summary: {
        totalAssets: files.length,
        inProgressAssets,
        totalStorageBytes: totalStorageBytes.toString(),
      },
      timeline,
      activities,
      domainHealth,
    })
  } catch (error) {
    console.error('Project Stats Error:', error)
    return res.status(500).json({ error: 'Failed to load project dashboard.' })
  }
}
