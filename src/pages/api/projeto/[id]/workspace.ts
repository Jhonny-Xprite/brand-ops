import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

import prisma from '@/lib/prisma'
import { serializeCreativeFile } from '@/lib/creativeFiles'
import {
  buildProjectWorkspaceWhere,
  buildWorkspaceTags,
  ensureProjectScopeDirectory,
  type ProjectWorkspaceScope,
} from '@/lib/projectWorkspace'
import { sanitizeFilename } from '@/lib/fileUtils'

type WorkspaceResponse =
  | {
      items: ReturnType<typeof serializeCreativeFile>[]
    }
  | {
      item: ReturnType<typeof serializeCreativeFile>
    }
  | { error: string }

function isAllowedScope(scope: string): scope is Exclude<ProjectWorkspaceScope, 'all'> {
  return ['strategy', 'media', 'social', 'config', 'copy'].includes(scope)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WorkspaceResponse>,
) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' })
  }

  if (req.method === 'GET') {
    const scopeParam =
      typeof req.query.scope === 'string' ? (req.query.scope as ProjectWorkspaceScope) : 'all'
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''

    try {
      const files = await prisma.creativeFile.findMany({
        where: {
          ...buildProjectWorkspaceWhere(id, scopeParam),
          ...(search
            ? {
                filename: {
                  contains: search,
                },
              }
            : {}),
        },
        include: {
          metadata: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })

      return res.status(200).json({
        items: files.map((file) => serializeCreativeFile(file)),
      })
    } catch (error) {
      console.error('Project Workspace Error:', error)
      return res.status(500).json({ error: 'Failed to load workspace assets.' })
    }
  }

  if (req.method === 'POST') {
    const { scope, title, content, extraTags = [] } = req.body as {
      scope?: string
      title?: string
      content?: string
      extraTags?: string[]
    }

    if (!scope || !isAllowedScope(scope)) {
      return res.status(400).json({ error: 'A valid workspace scope is required.' })
    }

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'Title and content are required.' })
    }

    try {
      const targetDirectory = ensureProjectScopeDirectory(id, scope)
      const sanitizedFilename = sanitizeFilename(title.trim().replace(/\s+/g, '-').toLowerCase())
      const filename = `${Date.now()}-${sanitizedFilename}.md`
      const filePath = path.join(targetDirectory, filename)

      fs.writeFileSync(filePath, content.trim(), 'utf8')
      const stats = fs.statSync(filePath)

      const record = await prisma.creativeFile.create({
        data: {
          filename,
          path: filePath,
          type: 'document',
          size: BigInt(stats.size),
          mimeType: 'text/markdown',
          metadata: {
            create: {
              type: 'document',
              status: 'Draft',
              tags: JSON.stringify(buildWorkspaceTags(id, scope, extraTags)),
              notes: content.trim().slice(0, 500),
            },
          },
        },
        include: {
          metadata: true,
        },
      })

      return res.status(201).json({
        item: serializeCreativeFile(record),
      })
    } catch (error) {
      console.error('Create Workspace Item Error:', error)
      return res.status(500).json({ error: 'Failed to create workspace item.' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

