import type { NextApiRequest, NextApiResponse } from 'next'

import {
  buildWorkspaceTags,
} from '@/lib/projectWorkspace'
import {
  isProjectLibraryDomain,
  serializeProjectLibraryPayload,
} from '@/lib/projectDomain'
import { serializeProjectLibraryItem } from '@/lib/projectLibrary'
import prisma from '@/lib/prisma'

type QuickCreateResponse =
  | { item: ReturnType<typeof serializeProjectLibraryItem> }
  | { file: { id: string } }
  | { error: string }

type TargetDomain = 'MEDIA_LIBRARY' | 'STRATEGY' | 'BRAND_CORE' | 'SOCIAL_ASSETS' | 'CREATIVE_PRODUCTION' | 'COPY_MESSAGING'

function toScope(domain: TargetDomain) {
  switch (domain) {
    case 'MEDIA_LIBRARY':
      return 'media'
    case 'SOCIAL_ASSETS':
      return 'social-assets'
    case 'CREATIVE_PRODUCTION':
      return 'creative-production'
    case 'COPY_MESSAGING':
      return 'copy-messaging'
    case 'BRAND_CORE':
      return 'brand-core'
    case 'STRATEGY':
    default:
      return 'strategy'
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<QuickCreateResponse>) {
  const { id: projectId } = req.query

  if (typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    targetDomain,
    title,
    category,
    description,
    content,
    status,
    payload,
    assetFileId,
    linkUrl,
  } = req.body as {
    targetDomain?: TargetDomain
    title?: string
    category?: string
    description?: string
    content?: string
    status?: string
    payload?: Record<string, string | boolean | string[] | null>
    assetFileId?: string
    linkUrl?: string
  }

  if (!targetDomain) {
    return res.status(400).json({ error: 'Target domain is required' })
  }

  if (targetDomain === 'MEDIA_LIBRARY') {
    if (!assetFileId) {
      return res.status(400).json({ error: 'Envie um arquivo para criar um item de media.' })
    }

    try {
      const existingFile = await prisma.creativeFile.findUnique({
        where: { id: assetFileId },
        include: { metadata: true },
      })

      if (!existingFile) {
        return res.status(404).json({ error: 'Arquivo de media nao encontrado.' })
      }

      const currentTags =
        existingFile.metadata?.tags
          ? JSON.parse(existingFile.metadata.tags)
          : []

      const nextTags = Array.from(
        new Set([
          ...currentTags,
          ...buildWorkspaceTags(projectId, toScope(targetDomain)),
        ]),
      )

      await prisma.fileMetadata.upsert({
        where: { fileId: assetFileId },
        update: {
          type: String(payload?.type ?? existingFile.metadata?.type ?? existingFile.type),
          status: status ?? existingFile.metadata?.status ?? 'Draft',
          tags: JSON.stringify(nextTags),
          notes: description ?? existingFile.metadata?.notes ?? '',
        },
        create: {
          fileId: assetFileId,
          type: String(payload?.type ?? existingFile.type),
          status: status ?? 'Draft',
          tags: JSON.stringify(nextTags),
          notes: description ?? '',
        },
      })

      return res.status(200).json({ file: { id: assetFileId } })
    } catch (error) {
      console.error('Failed to quick-create media item:', error)
      return res.status(500).json({ error: 'Nao foi possivel registrar este item de media.' })
    }
  }

  if (!isProjectLibraryDomain(targetDomain)) {
    return res.status(400).json({ error: 'Invalid overview target domain' })
  }

  if (!title?.trim() || !category?.trim()) {
    return res.status(400).json({ error: 'Titulo e categoria sao obrigatorios.' })
  }

  try {
    const created = await prisma.projectLibraryItem.create({
      data: {
        projectId,
        domain: targetDomain,
        category: category.trim(),
        title: title.trim(),
        description: description?.trim() || null,
        content: content?.trim() || null,
        status: status?.trim() || 'Draft',
        kind: assetFileId ? 'FILE' : linkUrl?.trim() ? 'LINK' : 'NOTE',
        payload: serializeProjectLibraryPayload(payload),
        assetFileId: assetFileId || null,
        linkUrl: linkUrl?.trim() || null,
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

    return res.status(201).json({ item: serializeProjectLibraryItem(created) })
  } catch (error) {
    console.error('Failed to quick-create overview item:', error)
    return res.status(500).json({ error: 'Nao foi possivel criar este item no overview.' })
  }
}
