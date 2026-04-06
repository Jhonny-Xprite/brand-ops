import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'

import { serializeCreativeFile } from '@/lib/creativeFiles'
import { validateFileUpload, loadFileValidationConfig, getHttpStatusCode } from '@/lib/fileValidation'
import prisma from '@/lib/prisma'
import { versioningService } from '@/lib/versioning'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (req.method === 'GET') {
    try {
      const file = await prisma.creativeFile.findUnique({
        where: { id },
        include: { metadata: true },
      })

      if (!file) {
        return res.status(404).json({ error: 'File not found' })
      }

      if (req.query.asset === 'preview') {
        if (!fs.existsSync(file.path)) {
          return res.status(404).json({ error: 'The file is no longer available. Choose the file again.' })
        }

        res.setHeader('Content-Type', file.mimeType || 'application/octet-stream')
        res.setHeader('Cache-Control', 'private, max-age=60')
        fs.createReadStream(file.path).pipe(res)
        return
      }

      const serializedFile = serializeCreativeFile(file)
      const versioning = await versioningService.requestVersionedChange({
        operationType: 'metadata',
        fileId: id,
        filePath: file.path,
        messagePayload: {
          filename: file.filename,
          type: file.metadata?.type ?? file.type,
          status: file.metadata?.status ?? 'Draft',
        },
        batchEligible: true,
        requiresExclusiveWrite: false,
        allowEmptyCommit: true,
      })

      return res.status(200).json({
        file: serializedFile,
        versioning: versioning.state,
      })
    } catch (err) {
      console.error('Fetch File Error:', err)
      return res.status(500).json({ error: 'Failed to fetch file' })
    }
  }

  if (req.method === 'PATCH') {
    const { type, status, tags, notes, filename, fileSizeBytes, mimeType } = req.body

    // Validate file content if being updated
    if (filename && fileSizeBytes !== undefined && mimeType) {
      try {
        const config = loadFileValidationConfig()
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
      } catch (err) {
        console.error('File Validation Error:', err)
        return res.status(500).json({ error: 'Failed to validate file' })
      }
    }

    if (type === '') {
      return res.status(400).json({ error: 'Please select a file type.' })
    }

    if (status === '') {
      return res.status(400).json({ error: 'Status is required.' })
    }

    if (Array.isArray(tags) && tags.length > 20) {
      return res.status(400).json({ error: 'You can add up to 20 tags.' })
    }

    if (typeof notes === 'string' && notes.length > 500) {
      return res.status(400).json({ error: 'Notes can have up to 500 characters.' })
    }

    try {
      await prisma.fileMetadata.upsert({
        where: { fileId: id },
        update: {
          type: type !== undefined ? type : undefined,
          status: status !== undefined ? status : undefined,
          tags: tags !== undefined ? JSON.stringify(tags) : undefined,
          notes: notes !== undefined ? notes : undefined,
        },
        create: {
          fileId: id,
          type: type || 'other',
          status: status || 'Draft',
          tags: JSON.stringify(tags || []),
          notes: notes || '',
        },
      })

      if (type) {
        await prisma.creativeFile.update({
          where: { id },
          data: { type },
        })
      }

      const file = await prisma.creativeFile.findUnique({
        where: { id },
        include: { metadata: true },
      })

      if (!file) {
        return res.status(404).json({ error: 'This item could not be loaded. Refresh and try again.' })
      }

      return res.status(200).json(serializeCreativeFile(file))
    } catch (err) {
      console.error('Update Metadata Error:', err)
      return res.status(500).json({ error: 'Failed to save your changes. Try again.' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
