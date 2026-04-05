import type { NextApiRequest, NextApiResponse } from 'next'

import { serializeProjectLibraryItem } from '@/lib/projectLibrary'
import prisma from '@/lib/prisma'

type ActionResponse =
  | { item: ReturnType<typeof serializeProjectLibraryItem>; message: string }
  | { error: string }

export default async function handler(req: NextApiRequest, res: NextApiResponse<ActionResponse>) {
  const { id: projectId, entryId } = req.query

  if (typeof projectId !== 'string' || typeof entryId !== 'string') {
    return res.status(400).json({ error: 'Invalid project or entry ID' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    action,
    title,
    category,
  } = req.body as {
    action?: 'rename' | 'duplicate' | 'recategorize'
    title?: string
    category?: string
  }

  const item = await prisma.projectLibraryItem.findFirst({
    where: { id: entryId, projectId },
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

  if (!item) {
    return res.status(404).json({ error: 'Item do overview nao encontrado.' })
  }

  try {
    if (action === 'rename') {
      if (!title?.trim()) {
        return res.status(400).json({ error: 'Informe um novo titulo.' })
      }

      const updated = await prisma.projectLibraryItem.update({
        where: { id: entryId },
        data: { title: title.trim() },
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

      return res.status(200).json({
        item: serializeProjectLibraryItem(updated),
        message: 'Titulo atualizado com sucesso.',
      })
    }

    if (action === 'recategorize') {
      if (!category?.trim()) {
        return res.status(400).json({ error: 'Informe a nova categoria.' })
      }

      const updated = await prisma.projectLibraryItem.update({
        where: { id: entryId },
        data: { category: category.trim() },
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

      return res.status(200).json({
        item: serializeProjectLibraryItem(updated),
        message: 'Categoria atualizada com sucesso.',
      })
    }

    if (action === 'duplicate') {
      const duplicated = await prisma.projectLibraryItem.create({
        data: {
          projectId,
          domain: item.domain,
          category: item.category,
          title: `${item.title} (Copia)`,
          description: item.description,
          content: item.content,
          status: item.status,
          kind: item.kind,
          payload: item.payload,
          linkUrl: item.linkUrl,
          assetFileId: item.assetFileId,
          isPrimary: false,
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

      return res.status(200).json({
        item: serializeProjectLibraryItem(duplicated),
        message: 'Item duplicado com sucesso.',
      })
    }

    return res.status(400).json({ error: 'Acao do overview invalida.' })
  } catch (error) {
    console.error('Failed to execute overview action:', error)
    return res.status(500).json({ error: 'Nao foi possivel executar esta acao no overview.' })
  }
}
