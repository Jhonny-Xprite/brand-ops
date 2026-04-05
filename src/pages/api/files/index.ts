import { NextApiRequest, NextApiResponse } from 'next'

import { serializeCreativeFile } from '@/lib/creativeFiles'
import { buildProjectWorkspaceWhere, type ProjectWorkspaceScope } from '@/lib/projectWorkspace'
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { projectId, scope } = req.query
      const where =
        typeof projectId === 'string'
          ? buildProjectWorkspaceWhere(
              projectId,
              typeof scope === 'string' ? (scope as ProjectWorkspaceScope) : 'all',
            )
          : undefined

      const files = await prisma.creativeFile.findMany({
        where,
        include: {
          metadata: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return res.status(200).json(files.map((file) => serializeCreativeFile(file)))
    } catch (err) {
      console.error('Fetch Files Error:', err)
      return res.status(500).json({ error: 'Failed to fetch files' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
