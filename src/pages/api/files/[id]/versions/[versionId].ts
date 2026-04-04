import type { NextApiRequest, NextApiResponse } from 'next'

import { serializeCreativeFile } from '@/lib/creativeFiles'
import prisma from '@/lib/prisma'
import { historyReader } from '@/lib/versioning/historyReader'

interface VersionDetailResponse {
  version: Awaited<ReturnType<typeof historyReader.readDetail>>
}

interface VersionDetailError {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VersionDetailResponse | VersionDetailError | Buffer>,
) {
  const { id, versionId, asset } = req.query

  if (typeof id !== 'string' || typeof versionId !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const file = await prisma.creativeFile.findUnique({
      where: { id },
      include: { metadata: true },
    })

    if (!file) {
      return res.status(404).json({ error: 'This item could not be loaded. Refresh and try again.' })
    }

    const version = await prisma.fileVersion.findFirst({
      where: {
        id: versionId,
        fileId: id,
      },
    })

    if (!version) {
      return res.status(404).json({ error: 'This item could not be loaded. Refresh and try again.' })
    }

    if (asset === 'preview') {
      try {
        const preview = historyReader.readPreview(file, version.commitHash)
        res.setHeader('Content-Type', preview.contentType)
        res.setHeader('Cache-Control', 'private, max-age=60')
        return res.status(200).send(preview.buffer)
      } catch (error) {
        const code = error instanceof Error ? error.message : 'GIT-004'
        const message =
          code === 'GIT-001'
            ? 'Version history is unavailable because the local repository is not ready.'
            : 'Preview unavailable for this file.'

        return res.status(code === 'GIT-001' ? 503 : 404).json({ error: message })
      }
    }

    const detail = await historyReader.readDetail(serializeCreativeFile(file), versionId)
    return res.status(200).json({ version: detail })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'GIT-004'

    if (code === 'DB-004') {
      return res.status(404).json({ error: 'This item could not be loaded. Refresh and try again.' })
    }

    console.error('Version History Detail Error:', error)
    return res.status(500).json({ error: 'Version history is unavailable right now. Try again.' })
  }
}
