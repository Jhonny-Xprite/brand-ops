import { NextApiRequest, NextApiResponse } from 'next'

import { serializeCreativeFile } from '@/lib/creativeFiles'
import { buildProjectWorkspaceWhere, type ProjectWorkspaceScope } from '@/lib/projectWorkspace'
import { validateFileUpload, loadFileValidationConfig, getHttpStatusCode } from '@/lib/fileValidation'
import { CreateFileSchema } from '@/lib/schemas'
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

  if (req.method === 'POST') {
    try {
      // Validate request body using Zod schema
      const parsed = CreateFileSchema.safeParse(req.body)

      if (!parsed.success) {
        const flattened = parsed.error.flatten()
        const errors = Object.entries(flattened.fieldErrors).map(([field, messages]) => ({
          field,
          message: messages?.[0] || 'Invalid value',
        }))
        return res.status(400).json({ error: 'Validation failed', details: errors })
      }

      const { filename, fileSizeBytes, mimeType, projectId } = parsed.data
      const config = loadFileValidationConfig()

      // Validate file upload using file validation utility
      const validationResult = validateFileUpload(
        filename,
        fileSizeBytes,
        mimeType,
        config
      )

      if (!validationResult.isValid) {
        const statusCode = getHttpStatusCode(validationResult)
        return res.status(statusCode).json({ error: validationResult.error })
      }

      // File validation passed - proceed with file creation
      // (Actual file save logic would be implemented here based on application requirements)

      return res.status(200).json({
        message: 'File validated successfully',
        file: { filename, mimeType, size: fileSizeBytes, projectId }
      })
    } catch (err) {
      console.error('Upload Files Error:', err)
      return res.status(500).json({ error: 'Failed to upload file' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
