import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import Busboy from 'busboy'

import { sanitizeFilename } from '@/lib/fileUtils'
import prisma from '@/lib/prisma'

export const config = {
  api: {
    bodyParser: false,
  },
}

const STORAGE_ROOT = 'E:\\BRAND-OPS-STORAGE'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB for logos
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']

interface ApiError {
  error: string
}

interface CreateProjectResponse {
  id: string
  name: string
  logoUrl?: string
  createdAt: string
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

interface FormFields {
  projectName?: string
}

interface UploadResult {
  fileId: string
  filePath: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateProjectResponse | ApiError>
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

  let uploadResult: UploadResult | null = null
  let uploadError: string | null = null
  let formFields: FormFields = {}

  const processUpload = () =>
    new Promise<{ uploadResult: UploadResult | null; formFields: FormFields }>((resolve, reject) => {
      const bb = Busboy({ headers: req.headers, limits: { fileSize: MAX_FILE_SIZE } })
      let completed = false

      bb.on('field', (fieldname, val) => {
        if (fieldname === 'projectName') {
          formFields.projectName = val
        }
      })

      bb.on('file', (_fieldName, file, info) => {
        const { filename: rawFilename, mimeType } = info

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(mimeType || '')) {
          uploadError = `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
          file.resume()
          return
        }

        const sanitizedFilename = sanitizeFilename(rawFilename)
        const timestamp = Date.now()
        const uniqueFilename = `logo_${timestamp}_${sanitizedFilename}`
        const targetPath = path.join(STORAGE_ROOT, uniqueFilename)
        const writeStream = fs.createWriteStream(targetPath)

        file.pipe(writeStream)

        file.on('limit', () => {
          uploadError = 'File too large. Maximum size is 5 MB.'
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
                filename: uniqueFilename,
                path: targetPath,
                type: 'image',
                size: BigInt(stats.size),
                mimeType: mimeType || 'application/octet-stream',
                metadata: {
                  create: {
                    type: 'image',
                    status: 'Active',
                    tags: '["project-logo"]',
                  },
                },
              },
            })

            uploadResult = {
              fileId: record.id,
              filePath: record.path,
            }

            if (completed) {
              resolve({ uploadResult, formFields })
            }
          } catch (err) {
            reject(err)
          }
        })

        writeStream.on('error', (err) => reject(new Error(getFilesystemErrorMessage(err))))
      })

      bb.on('finish', () => {
        completed = true
        resolve({ uploadResult, formFields })
      })

      bb.on('error', (err: Error) => reject(err))
      req.pipe(bb)
    })

  try {
    const { uploadResult: result, formFields: fields } = await processUpload()

    // Validate project name
    const projectName = fields.projectName?.trim()
    if (!projectName) {
      if (result) {
        // Clean up uploaded file if validation fails
        if (fs.existsSync(result.filePath)) {
          fs.unlinkSync(result.filePath)
        }
        await prisma.creativeFile.delete({ where: { id: result.fileId } })
      }
      return res.status(400).json({ error: 'Project name is required' })
    }

    if (projectName.length < 3 || projectName.length > 50) {
      if (result) {
        // Clean up uploaded file if validation fails
        if (fs.existsSync(result.filePath)) {
          fs.unlinkSync(result.filePath)
        }
        await prisma.creativeFile.delete({ where: { id: result.fileId } })
      }
      return res.status(400).json({ error: 'Project name must be between 3 and 50 characters' })
    }

    if (uploadError) {
      return res.status(400).json({ error: uploadError })
    }

    // Create project in database
    const project = await prisma.project.create({
      data: {
        name: projectName,
        logoFileId: result?.fileId,
      },
    })

    return res.status(201).json({
      id: project.id,
      name: project.name,
      logoUrl: result?.filePath,
      createdAt: project.createdAt.toISOString(),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create project'
    console.error('Create Project Error:', err)
    return res.status(500).json({ error: message })
  }
}
