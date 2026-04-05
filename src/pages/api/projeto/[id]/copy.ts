import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

import prisma from '@/lib/prisma'
import { serializeCreativeFile } from '@/lib/creativeFiles'
import {
  buildWorkspaceTags,
  ensureProjectScopeDirectory,
} from '@/lib/projectWorkspace'
import { sanitizeFilename } from '@/lib/fileUtils'

interface CopyEntryResponse {
  id: string
  title: string
  content: string
  copyType: string
  angle: string
  audience: string
  updatedAt: string
  fileId: string
}

type CopyResponse =
  | { items: CopyEntryResponse[] }
  | { item: CopyEntryResponse }
  | { error: string }

function toCopyEntry(file: ReturnType<typeof serializeCreativeFile>): CopyEntryResponse {
  const tags = file.metadata?.tags ?? []
  const readValue = (prefix: string) => tags.find((tag) => tag.startsWith(prefix))?.slice(prefix.length) ?? ''

  return {
    id: file.id,
    title: file.filename.replace(/^\d+-/, '').replace(/\.txt$/, '').replace(/-/g, ' '),
    content: file.metadata?.notes ?? '',
    copyType: readValue('copy-type:') || 'headline',
    angle: readValue('angle:') || 'geral',
    audience: readValue('audience:') || 'todos',
    updatedAt: new Date(file.updatedAt).toISOString(),
    fileId: file.id,
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CopyResponse>,
) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' })
  }

  if (req.method === 'GET') {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : ''
    const angle = typeof req.query.angle === 'string' ? req.query.angle : ''
    const audience = typeof req.query.audience === 'string' ? req.query.audience : ''

    try {
      const files = await prisma.creativeFile.findMany({
        where: {
          AND: [
            {
              metadata: {
                tags: {
                  contains: `project-${id}`,
                },
              },
            },
            {
              metadata: {
                tags: {
                  contains: 'scope:copy',
                },
              },
            },
          ],
        },
        include: {
          metadata: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })

      const items = files
        .map((file) => serializeCreativeFile(file))
        .map((file) => toCopyEntry(file))
        .filter((entry) => {
          const matchesSearch =
            !search ||
            entry.title.toLowerCase().includes(search) ||
            entry.content.toLowerCase().includes(search)
          const matchesAngle = !angle || entry.angle === angle
          const matchesAudience = !audience || entry.audience === audience

          return matchesSearch && matchesAngle && matchesAudience
        })

      return res.status(200).json({ items })
    } catch (error) {
      console.error('Copy Library Error:', error)
      return res.status(500).json({ error: 'Failed to load copy library.' })
    }
  }

  if (req.method === 'POST') {
    const { title, content, copyType, angle, audience } = req.body as {
      title?: string
      content?: string
      copyType?: string
      angle?: string
      audience?: string
    }

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'Title and content are required.' })
    }

    try {
      const targetDirectory = ensureProjectScopeDirectory(id, 'copy')
      const sanitizedFilename = sanitizeFilename(title.trim().replace(/\s+/g, '-').toLowerCase())
      const filename = `${Date.now()}-${sanitizedFilename}.txt`
      const filePath = path.join(targetDirectory, filename)
      const normalizedType = copyType?.trim() || 'headline'
      const normalizedAngle = angle?.trim() || 'geral'
      const normalizedAudience = audience?.trim() || 'todos'

      fs.writeFileSync(filePath, content.trim(), 'utf8')
      const stats = fs.statSync(filePath)

      const record = await prisma.creativeFile.create({
        data: {
          filename,
          path: filePath,
          type: 'document',
          size: BigInt(stats.size),
          mimeType: 'text/plain',
          metadata: {
            create: {
              type: 'document',
              status: 'Approved',
              tags: JSON.stringify(
                buildWorkspaceTags(id, 'copy', [
                  `copy-type:${normalizedType}`,
                  `angle:${normalizedAngle}`,
                  `audience:${normalizedAudience}`,
                ]),
              ),
              notes: content.trim(),
            },
          },
        },
        include: {
          metadata: true,
        },
      })

      return res.status(201).json({
        item: toCopyEntry(serializeCreativeFile(record)),
      })
    } catch (error) {
      console.error('Create Copy Entry Error:', error)
      return res.status(500).json({ error: 'Failed to create copy entry.' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
