import type { NextApiRequest, NextApiResponse } from 'next'

import {
  isProjectLibraryDomain,
  isProjectLibraryItemKind,
  isProjectLibraryRelationType,
  serializeProjectLibraryPayload,
  type SerializedProjectLibraryItem,
} from '@/lib/projectDomain'
import { serializeProjectLibraryItem } from '@/lib/projectLibrary'
import prisma from '@/lib/prisma'

type LibraryResponse =
  | { items: SerializedProjectLibraryItem[] }
  | { item: SerializedProjectLibraryItem }
  | { error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LibraryResponse>,
) {
  const { id: projectId } = req.query

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' })
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  })

  if (!project) {
    return res.status(404).json({ error: 'Project not found' })
  }

  if (req.method === 'GET') {
    const domain = typeof req.query.domain === 'string' ? req.query.domain : ''
    const category = typeof req.query.category === 'string' ? req.query.category : ''
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''

    if (domain && !isProjectLibraryDomain(domain)) {
      return res.status(400).json({ error: 'Invalid library domain' })
    }

    try {
      const items = await prisma.projectLibraryItem.findMany({
        where: {
          projectId,
          ...(domain ? { domain } : {}),
          ...(category ? { category } : {}),
          ...(search
            ? {
                OR: [
                  { title: { contains: search } },
                  { description: { contains: search } },
                  { content: { contains: search } },
                ],
              }
            : {}),
        },
        include: {
          assetFile: {
            select: {
              id: true,
              filename: true,
              mimeType: true,
            },
          },
          outgoingRelations: {
            include: {
              targetItem: {
                select: {
                  id: true,
                  domain: true,
                  category: true,
                  title: true,
                },
              },
            },
          },
        },
        orderBy: [{ isPrimary: 'desc' }, { updatedAt: 'desc' }],
      })

      return res.status(200).json({
        items: items.map((item) => serializeProjectLibraryItem(item)),
      })
    } catch (error) {
      console.error('Failed to fetch project library items:', error)
      return res.status(500).json({ error: 'Failed to fetch library items' })
    }
  }

  if (req.method === 'POST') {
    const {
      domain,
      category,
      title,
      description,
      content,
      status,
      kind,
      payload,
      linkUrl,
      assetFileId,
      isPrimary,
      relationTargets,
    } = req.body as {
      domain?: string
      category?: string
      title?: string
      description?: string
      content?: string
      status?: string
      kind?: string
      payload?: Record<string, string | boolean | string[] | null>
      linkUrl?: string
      assetFileId?: string
      isPrimary?: boolean
      relationTargets?: Array<{ targetItemId: string; relationType: string }>
    }

    if (!domain || !isProjectLibraryDomain(domain)) {
      return res.status(400).json({ error: 'Invalid library domain' })
    }

    if (!category?.trim()) {
      return res.status(400).json({ error: 'Category is required' })
    }

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required' })
    }

    const normalizedKind = kind && isProjectLibraryItemKind(kind) ? kind : 'NOTE'
    const normalizedRelationTargets =
      relationTargets?.filter(
        (relation): relation is { targetItemId: string; relationType: string } =>
          Boolean(relation?.targetItemId) && Boolean(relation?.relationType) && isProjectLibraryRelationType(relation.relationType),
      ) ?? []

    try {
      const created = await prisma.$transaction(async (tx) => {
        if (
          domain === 'BRAND_CORE' &&
          category.trim().toUpperCase() === 'LOGOTIPOS' &&
          isPrimary
        ) {
          await tx.projectLibraryItem.updateMany({
            where: {
              projectId,
              domain: 'BRAND_CORE',
              category: 'LOGOTIPOS',
            },
            data: {
              isPrimary: false,
            },
          })
        }

        const item = await tx.projectLibraryItem.create({
          data: {
            projectId,
            domain,
            category: category.trim(),
            title: title.trim(),
            description: description?.trim() || null,
            content: content?.trim() || null,
            status: status?.trim() || 'Draft',
            kind: normalizedKind,
            payload: serializeProjectLibraryPayload(payload),
            linkUrl: linkUrl?.trim() || null,
            assetFileId: assetFileId || null,
            isPrimary: Boolean(isPrimary),
          },
          include: {
            assetFile: {
              select: {
                id: true,
                filename: true,
                mimeType: true,
              },
            },
            outgoingRelations: {
              include: {
                targetItem: {
                  select: {
                    id: true,
                    domain: true,
                    category: true,
                    title: true,
                  },
                },
              },
            },
          },
        })

        if (normalizedRelationTargets.length > 0) {
          const relationTargetsExist = await tx.projectLibraryItem.findMany({
            where: {
              id: { in: normalizedRelationTargets.map((relation) => relation.targetItemId) },
              projectId,
            },
            select: { id: true },
          })

          const validTargetIds = new Set(relationTargetsExist.map((entry) => entry.id))

          if (validTargetIds.size > 0) {
            const uniqueRelations = Array.from(
              new Map(
                normalizedRelationTargets
                  .filter((relation) => validTargetIds.has(relation.targetItemId))
                  .map((relation) => [`${relation.targetItemId}:${relation.relationType}`, relation]),
              ).values(),
            )

            await tx.projectLibraryItemRelation.createMany({
              data: uniqueRelations
                .map((relation) => ({
                  sourceItemId: item.id,
                  targetItemId: relation.targetItemId,
                  relationType: relation.relationType,
                })),
            })
          }
        }

        const itemWithRelations = await tx.projectLibraryItem.findUniqueOrThrow({
          where: { id: item.id },
          include: {
            assetFile: {
              select: {
                id: true,
                filename: true,
                mimeType: true,
              },
            },
            outgoingRelations: {
              include: {
                targetItem: {
                  select: {
                    id: true,
                    domain: true,
                    category: true,
                    title: true,
                  },
                },
              },
            },
          },
        })

        if (
          itemWithRelations.domain === 'BRAND_CORE' &&
          itemWithRelations.category === 'LOGOTIPOS' &&
          itemWithRelations.isPrimary &&
          itemWithRelations.assetFileId
        ) {
          await tx.project.update({
            where: { id: projectId },
            data: {
              logoFileId: itemWithRelations.assetFileId,
            },
          })
        }

        return itemWithRelations
      })

      return res.status(201).json({
        item: serializeProjectLibraryItem(created),
      })
    } catch (error) {
      console.error('Failed to create library item:', error)
      return res.status(500).json({ error: 'Failed to create library item' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
