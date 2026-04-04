import type { NextApiRequest, NextApiResponse } from 'next'

import prisma from '@/lib/prisma'
import { historyReader } from '@/lib/versioning/historyReader'

interface VersionsResponse {
  versions: Awaited<ReturnType<typeof historyReader.readTimeline>>
}

interface VersionsError {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VersionsResponse | VersionsError>,
) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const file = await prisma.creativeFile.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!file) {
      return res.status(404).json({ error: 'This item could not be loaded. Refresh and try again.' })
    }

    const versions = await historyReader.readTimeline(id)

    return res.status(200).json({ versions })
  } catch (error) {
    console.error('Version History Load Error:', error)
    return res.status(500).json({ error: 'Version history is unavailable right now. Try again.' })
  }
}
