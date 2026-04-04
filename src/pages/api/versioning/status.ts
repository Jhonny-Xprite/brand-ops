import type { NextApiRequest, NextApiResponse } from 'next'

import { versioningService } from '@/lib/versioning'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { fileId } = req.query

  if (typeof fileId === 'string') {
    return res.status(200).json({
      state: versioningService.getLifecycleState(fileId),
    })
  }

  return res.status(200).json({
    states: versioningService.getLifecycleState(),
  })
}
