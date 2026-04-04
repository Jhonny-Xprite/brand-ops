import fs from 'fs'
import path from 'path'
import type { NextApiRequest, NextApiResponse } from 'next'

import Busboy from 'busboy'

import { serializeCreativeFile } from '@/lib/creativeFiles'
import { detectFileType, sanitizeFilename } from '@/lib/fileUtils'
import prisma from '@/lib/prisma'
import { versioningService, type VersioningLifecycleState } from '@/lib/versioning'

export const config = {
  api: {
    bodyParser: false,
  },
}

const MAX_FILE_SIZE = 100 * 1024 * 1024

interface ReplaceResponse {
  file: ReturnType<typeof serializeCreativeFile>
  versioning: VersioningLifecycleState
}

interface ReplaceError {
  error: string
}

function getFilesystemErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : null

  if (code === 'EACCES' || code === 'EPERM') {
    return 'Permission denied. Check folder permissions and try again.'
  }

  if (code === 'ENOSPC') {
    return 'Storage is full. Free up space and try again.'
  }

  return 'Storage folder is unavailable. Check the local storage path and try again.'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ReplaceResponse | ReplaceError>) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const currentFile = await prisma.creativeFile.findUnique({
    where: { id },
    include: { metadata: true },
  })

  if (!currentFile) {
    return res.status(404).json({ error: 'This item could not be loaded. Refresh and try again.' })
  }

  if (!fs.existsSync(currentFile.path)) {
    return res.status(404).json({ error: 'The file is no longer available. Choose the file again.' })
  }

  const tempUploadPath = `${currentFile.path}.replace-upload`
  const backupPath = `${currentFile.path}.backup`

  try {
    await new Promise<void>((resolve, reject) => {
      const bb = Busboy({ headers: req.headers, limits: { fileSize: MAX_FILE_SIZE } })
      let hasFile = false

      bb.on('file', (_fieldName, file, info) => {
        hasFile = true
        const sanitizedName = sanitizeFilename(info.filename)
        const tempTarget = tempUploadPath + path.extname(sanitizedName)
        const writeStream = fs.createWriteStream(tempTarget)

        file.pipe(writeStream)

        file.on('limit', () => {
          file.resume()
          reject(new Error('File too large. Maximum size is 100 MB.'))
        })

        writeStream.on('finish', () => {
          if (tempTarget !== tempUploadPath && fs.existsSync(tempTarget)) {
            fs.renameSync(tempTarget, tempUploadPath)
          }
          resolve()
        })

        writeStream.on('error', reject)
      })

      bb.on('finish', () => {
        if (!hasFile) {
          reject(new Error('Storage folder is unavailable. Check the local storage path and try again.'))
        }
      })

      bb.on('error', reject)
      req.pipe(bb)
    })

    fs.renameSync(currentFile.path, backupPath)
    fs.renameSync(tempUploadPath, currentFile.path)

    const stats = fs.statSync(currentFile.path)
    const updated = await prisma.creativeFile.update({
      where: { id },
      data: {
        type: detectFileType(currentFile.filename),
        size: BigInt(stats.size),
        mimeType: currentFile.mimeType,
      },
      include: { metadata: true },
    })

    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath)
    }

    const serializedFile = serializeCreativeFile(updated)
    const versioning = await versioningService.requestVersionedChange({
      operationType: 'replace',
      fileId: updated.id,
      filePath: updated.path,
      messagePayload: {
        filename: updated.filename,
      },
      batchEligible: false,
      requiresExclusiveWrite: true,
      allowEmptyCommit: false,
    })

    return res.status(200).json({
      file: serializedFile,
      versioning: versioning.state,
    })
  } catch (error) {
    if (fs.existsSync(backupPath) && !fs.existsSync(currentFile.path)) {
      fs.renameSync(backupPath, currentFile.path)
    }

    if (fs.existsSync(tempUploadPath)) {
      fs.unlinkSync(tempUploadPath)
    }

    const message = error instanceof Error ? error.message : getFilesystemErrorMessage(error)
    return res.status(400).json({ error: message })
  }
}
