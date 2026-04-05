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

type LibraryItemResponse =
  | { item: SerializedProjectLibraryItem }
  | { success: true }
  | { error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LibraryItemResponse>,
) {
  const { id: projectId, itemId } = req.query

  if (!projectId || typeof projectId !== 'string' || !itemId || typeof itemId !== 'string') {
    return res.status(400).json({ error: 'Invalid project or item ID' })
  }

  const existingItem = await prisma.projectLibraryItem.findFirst({
    where: {
      id: itemId,
      projectId,
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

  if (!existingItem) {
    return res.status(404).json({ error: 'Library item not found' })
  }

  if (req.method === 'PATCH') {
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
      assetFileId?: string | null
      isPrimary?: boolean
      relationTargets?: Array<{ targetItemId: string; relationType: string }>
    }

    if (domain && !isProjectLibraryDomain(domain)) {
      return res.status(400).json({ error: 'Invalid library domain' })
    }

    if (kind && !isProjectLibraryItemKind(kind)) {
      return res.status(400).json({ error: 'Invalid library item kind' })
    }

    if (
      relationTargets &&
      relationTargets.some(
        (relation) =>
          !relation?.targetItemId ||
          !relation?.relationType ||
          !isProjectLibraryRelationType(relation.relationType),
      )
    ) {
      return res.status(400).json({ error: 'Invalid relation target payload' })
    }

    try {
      const updated = await prisma.$transaction(async (tx) => {
        const nextDomain = domain || existingItem.domain
        const nextCategory = category?.trim() || existingItem.category
        const nextIsPrimary = typeof isPrimary === 'boolean' ? isPrimary : existingItem.isPrimary

        if (
          nextDomain === 'BRAND_CORE' &&
          nextCategory === 'LOGOTIPOS' &&
          nextIsPrimary
        ) {
          await tx.projectLibraryItem.updateMany({
            where: {
              projectId,
              domain: 'BRAND_CORE',
              category: 'LOGOTIPOS',
              NOT: { id: itemId },
            },
            data: {
              isPrimary: false,
            },
          })
        }

        const item = await tx.projectLibraryItem.update({
          where: { id: itemId },
          data: {
            domain: domain || undefined,
            category: category?.trim() || undefined,
            title: title?.trim() || undefined,
            description: description !== undefined ? description?.trim() || null : undefined,
            content: content !== undefined ? content?.trim() || null : undefined,
            status: status?.trim() || undefined,
            kind: kind || undefined,
            payload: payload ? serializeProjectLibraryPayload(payload) : undefined,
            linkUrl: linkUrl !== undefined ? linkUrl?.trim() || null : undefined,
            assetFileId: assetFileId !== undefined ? assetFileId || null : undefined,
            isPrimary: typeof isPrimary === 'boolean' ? isPrimary : undefined,
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

        if (relationTargets) {
          await tx.projectLibraryItemRelation.deleteMany({
            where: { sourceItemId: itemId },
          })

          if (relationTargets.length > 0) {
            const existingTargets = await tx.projectLibraryItem.findMany({
              where: {
                id: { in: relationTargets.map((relation) => relation.targetItemId) },
                projectId,
              },
              select: { id: true },
            })

            const validTargetIds = new Set(existingTargets.map((entry) => entry.id))

            if (validTargetIds.size > 0) {
              const uniqueRelations = Array.from(
                new Map(
                  relationTargets
                    .filter((relation) => validTargetIds.has(relation.targetItemId))
                    .map((relation) => [`${relation.targetItemId}:${relation.relationType}`, relation]),
                ).values(),
              )

              await tx.projectLibraryItemRelation.createMany({
                data: uniqueRelations
                  .map((relation) => ({
                    sourceItemId: itemId,
                    targetItemId: relation.targetItemId,
                    relationType: relation.relationType,
                  })),
              })
            }
          }
        }

        const updatedWithRelations = await tx.projectLibraryItem.findUniqueOrThrow({
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
          updatedWithRelations.domain === 'BRAND_CORE' &&
          updatedWithRelations.category === 'LOGOTIPOS' &&
          updatedWithRelations.isPrimary
        ) {
          await tx.project.update({
            where: { id: projectId },
            data: {
              logoFileId: updatedWithRelations.assetFileId || null,
            },
          })
        }

        return updatedWithRelations
      })

      return res.status(200).json({
        item: serializeProjectLibraryItem(updated),
      })
    } catch (error) {
      console.error('Failed to update library item:', error)
      return res.status(500).json({ error: 'Failed to update library item' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.projectLibraryItemRelation.deleteMany({
        where: {
          OR: [{ sourceItemId: itemId }, { targetItemId: itemId }],
        },
      })

      if (
        existingItem.domain === 'BRAND_CORE' &&
        existingItem.category === 'LOGOTIPOS' &&
        existingItem.isPrimary
      ) {
        await prisma.project.update({
          where: { id: projectId },
          data: { logoFileId: null },
        })
      }

      await prisma.projectLibraryItem.delete({
        where: { id: itemId },
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Failed to delete library item:', error)
      return res.status(500).json({ error: 'Failed to delete library item' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
