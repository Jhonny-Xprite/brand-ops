import type { NextApiRequest, NextApiResponse } from 'next'

import { serializeCreativeFile } from '@/lib/creativeFiles'
import {
  isProjectLibraryDomain,
  serializeProjectLibraryPayload,
} from '@/lib/projectDomain'
import { serializeProjectLibraryItem } from '@/lib/projectLibrary'
import prisma from '@/lib/prisma'

type OverviewPatchResponse =
  | { item: ReturnType<typeof serializeProjectLibraryItem> }
  | { file: ReturnType<typeof serializeCreativeFile> }
  | { error: string }

export default async function handler(req: NextApiRequest, res: NextApiResponse<OverviewPatchResponse>) {
  const { id: projectId, entryId } = req.query

  if (typeof projectId !== 'string' || typeof entryId !== 'string') {
    return res.status(400).json({ error: 'Invalid project or entry ID' })
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sourceType } = req.body as { sourceType?: 'FILE' | 'LIBRARY_ITEM' }

  try {
    if (sourceType === 'FILE') {
      const {
        type,
        status,
        tags,
        notes,
      } = req.body as {
        sourceType: 'FILE'
        type?: string
        status?: string
        tags?: string[]
        notes?: string
      }

      await prisma.fileMetadata.upsert({
        where: { fileId: entryId },
        update: {
          type: type ?? undefined,
          status: status ?? undefined,
          tags: tags ? JSON.stringify(tags) : undefined,
          notes: notes ?? undefined,
        },
        create: {
          fileId: entryId,
          type: type || 'other',
          status: status || 'Draft',
          tags: JSON.stringify(tags || []),
          notes: notes || '',
        },
      })

      const file = await prisma.creativeFile.findUnique({
        where: { id: entryId },
        include: { metadata: true },
      })

      if (!file) {
        return res.status(404).json({ error: 'Arquivo nao encontrado.' })
      }

      return res.status(200).json({ file: serializeCreativeFile(file) })
    }

    const {
      domain,
      category,
      title,
      description,
      content,
      status,
      payload,
      linkUrl,
      assetFileId,
    } = req.body as {
      sourceType: 'LIBRARY_ITEM'
      domain?: string
      category?: string
      title?: string
      description?: string
      content?: string
      status?: string
      payload?: Record<string, string | boolean | string[] | null>
      linkUrl?: string
      assetFileId?: string | null
    }

    if (domain && !isProjectLibraryDomain(domain)) {
      return res.status(400).json({ error: 'Invalid overview library domain' })
    }

    const existing = await prisma.projectLibraryItem.findFirst({
      where: { id: entryId, projectId },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Item de biblioteca nao encontrado.' })
    }

    const updated = await prisma.projectLibraryItem.update({
      where: { id: entryId },
      data: {
        domain: domain || undefined,
        category: category?.trim() || undefined,
        title: title?.trim() || undefined,
        description: description !== undefined ? description?.trim() || null : undefined,
        content: content !== undefined ? content?.trim() || null : undefined,
        status: status?.trim() || undefined,
        payload: payload ? serializeProjectLibraryPayload(payload) : undefined,
        linkUrl: linkUrl !== undefined ? linkUrl?.trim() || null : undefined,
        assetFileId: assetFileId !== undefined ? assetFileId : undefined,
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

    return res.status(200).json({ item: serializeProjectLibraryItem(updated) })
  } catch (error) {
    console.error('Failed to patch overview entry:', error)
    return res.status(500).json({ error: 'Nao foi possivel atualizar este item do overview.' })
  }
}
