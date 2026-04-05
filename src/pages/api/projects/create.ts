import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import Busboy from 'busboy'

import { sanitizeFilename } from '@/lib/fileUtils'
import { coerceBusinessModel, isBusinessModel, type ProjectBusinessModel } from '@/lib/projectDomain'
import prisma from '@/lib/prisma'
import { ensureStorageRoot, getFilesystemErrorMessage, STORAGE_ROOT } from '@/lib/storageRoot'

export const config = {
  api: {
    bodyParser: false,
  },
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB for logos
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']

interface CreateProjectResponse {
  id: string
  name: string
  niche: string
  businessModel: ProjectBusinessModel
  logoUrl?: string
  assetCount: number
  createdAt: string
  socialLinks: {
    instagramUrl?: string
    youtubeUrl?: string
    facebookUrl?: string
    tiktokUrl?: string
  }
}
interface ApiError {
  error: string
}

interface FormFields {
  projectName?: string
  niche?: string
  businessModel?: string
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
  const formFields: FormFields = {}

  const processUpload = () =>
    new Promise<{ uploadResult: UploadResult | null; formFields: FormFields }>((resolve, reject) => {
      const bb = Busboy({ headers: req.headers, limits: { fileSize: MAX_FILE_SIZE } })
      let completed = false

      bb.on('field', (fieldname, val) => {
        if (fieldname === 'projectName') {
          formFields.projectName = val
        }
        if (fieldname === 'niche') {
          formFields.niche = val
        }
        if (fieldname === 'businessModel') {
          formFields.businessModel = val
        }
      })

      bb.on('file', (_fieldName, file, info) => {
        const { filename: rawFilename, mimeType } = info

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(mimeType || '')) {
          uploadError = `Tipo de arquivo invalido. Tipos permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`
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
          uploadError = 'Arquivo grande demais. O tamanho maximo permitido e 5 MB.'
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
      return res.status(400).json({ error: 'O nome do projeto e obrigatorio.' })
    }

    if (projectName.length < 3 || projectName.length > 50) {
      if (result) {
        // Clean up uploaded file if validation fails
        if (fs.existsSync(result.filePath)) {
          fs.unlinkSync(result.filePath)
        }
        await prisma.creativeFile.delete({ where: { id: result.fileId } })
      }
      return res.status(400).json({ error: 'O nome do projeto deve ter entre 3 e 50 caracteres.' })
    }

    const niche = fields.niche?.trim()
    if (!niche) {
      if (result) {
        if (fs.existsSync(result.filePath)) {
          fs.unlinkSync(result.filePath)
        }
        await prisma.creativeFile.delete({ where: { id: result.fileId } })
      }
      return res.status(400).json({ error: 'O nicho do projeto e obrigatorio.' })
    }

    if (niche.length < 2 || niche.length > 60) {
      if (result) {
        if (fs.existsSync(result.filePath)) {
          fs.unlinkSync(result.filePath)
        }
        await prisma.creativeFile.delete({ where: { id: result.fileId } })
      }
      return res.status(400).json({ error: 'O nicho do projeto deve ter entre 2 e 60 caracteres.' })
    }

    if (!fields.businessModel || !isBusinessModel(fields.businessModel)) {
      if (result) {
        if (fs.existsSync(result.filePath)) {
          fs.unlinkSync(result.filePath)
        }
        await prisma.creativeFile.delete({ where: { id: result.fileId } })
      }
      return res.status(400).json({ error: 'Selecione um modelo de negocio valido.' })
    }

    if (uploadError) {
      return res.status(400).json({ error: uploadError })
    }

    // Create project in database
    const project = await prisma.project.create({
      data: {
        name: projectName,
        niche,
        businessModel: fields.businessModel,
        logoFileId: result?.fileId,
      },
    })

    return res.status(201).json({
      id: project.id,
      name: project.name,
      niche: project.niche,
      businessModel: coerceBusinessModel(project.businessModel),
      logoUrl: result?.fileId ? `/api/files/${result.fileId}?asset=preview` : undefined,
      assetCount: 0,
      createdAt: project.createdAt.toISOString(),
      socialLinks: {},
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create project'
    console.error('Create Project Error:', err)
    return res.status(500).json({ error: message })
  }
}
