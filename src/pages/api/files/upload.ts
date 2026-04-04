import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

import Busboy from 'busboy'

import { serializeCreativeFile, type SerializedCreativeFile } from '@/lib/creativeFiles'
import { sanitizeFilename, detectFileType } from '@/lib/fileUtils'
import prisma from '@/lib/prisma'
import { versioningService, type VersioningLifecycleState } from '@/lib/versioning'

export const config = {
  api: {
    bodyParser: false,
  },
}

const STORAGE_ROOT = 'E:\\BRAND-OPS-STORAGE'
const MAX_FILE_SIZE = 100 * 1024 * 1024

interface ApiError {
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

async function ensureStorageRoot(): Promise<void> {
  if (!fs.existsSync(STORAGE_ROOT)) {
    fs.mkdirSync(STORAGE_ROOT, { recursive: true })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ file: SerializedCreativeFile; versioning: VersioningLifecycleState } | ApiError>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await ensureStorageRoot()
  } catch (err) {
    console.error('Failed to create storage directory:', err)
    return res.status(500).json({ error: getFilesystemErrorMessage(err) })
  }

  let fileData: SerializedCreativeFile | null = null
  let uploadError: string | null = null

  const processUpload = () =>
    new Promise<SerializedCreativeFile>((resolve, reject) => {
      const bb = Busboy({ headers: req.headers, limits: { fileSize: MAX_FILE_SIZE } })
      let completed = false

      bb.on('file', (_fieldName, file, info) => {
        const { filename: rawFilename, mimeType } = info
        const sanitizedFilename = sanitizeFilename(rawFilename)
        const targetPath = path.join(STORAGE_ROOT, sanitizedFilename)
        const fileType = detectFileType(sanitizedFilename)
        const writeStream = fs.createWriteStream(targetPath)

        file.pipe(writeStream)

        file.on('limit', () => {
          uploadError = 'File too large. Maximum size is 100 MB.'
          file.resume()
        })

        writeStream.on('finish', async () => {
          try {
            if (uploadError) {
              if (fs.existsSync(targetPath)) {
                fs.unlinkSync(targetPath)
              }
              return
            }

            const stats = fs.statSync(targetPath)
            const record = await prisma.creativeFile.create({
              data: {
                filename: sanitizedFilename,
                path: targetPath,
                type: fileType,
                size: BigInt(stats.size),
                mimeType: mimeType || 'application/octet-stream',
                metadata: {
                  create: {
                    type: fileType,
                    status: 'Draft',
                    tags: '[]',
                  },
                },
              },
              include: {
                metadata: true,
              },
            })

            fileData = serializeCreativeFile(record)

            if (completed && fileData) {
              resolve(fileData)
            }
          } catch (err) {
            reject(err)
          }
        })

        writeStream.on('error', (err) => reject(new Error(getFilesystemErrorMessage(err))))
      })

      bb.on('finish', () => {
        completed = true

        if (fileData) {
          resolve(fileData)
        } else if (uploadError) {
          reject(new Error(uploadError))
        } else {
          reject(new Error('Storage folder is unavailable. Check the local storage path and try again.'))
        }
      })

      bb.on('error', (err: Error) => reject(err))
      req.pipe(bb)
    })

  try {
    const result = await processUpload()
    const versioning = await versioningService.requestVersionedChange({
      operationType: 'upload',
      fileId: result.id,
      filePath: result.path,
      messagePayload: {
        filename: result.filename,
      },
      batchEligible: false,
      requiresExclusiveWrite: false,
      allowEmptyCommit: false,
    })

    return res.status(200).json({
      file: result,
      versioning: versioning.state,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : getFilesystemErrorMessage(err)
    console.error('Upload Error:', err)
    return res.status(400).json({ error: message })
  }
}
