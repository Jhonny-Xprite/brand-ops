import fs from 'fs'
import path from 'path'
import { NextApiRequest, NextApiResponse } from 'next'

import { serializeCreativeFile } from '@/lib/creativeFiles'
import { buildDuplicateFilename, buildRenamedFilename } from '@/lib/creativeLibraryActions'
import prisma from '@/lib/prisma'

interface ActionResponse {
  action: 'rename' | 'duplicate'
  file: ReturnType<typeof serializeCreativeFile>
  message: string
}

interface ActionError {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ActionResponse | ActionError>,
) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action, filenameBase } = req.body as {
    action?: 'rename' | 'duplicate'
    filenameBase?: string
  }

  if (action !== 'rename' && action !== 'duplicate') {
    return res.status(400).json({ error: 'Invalid file action.' })
  }

  try {
    const file = await prisma.creativeFile.findUnique({
      where: { id },
      include: { metadata: true },
    })

    if (!file) {
      return res.status(404).json({ error: 'This item could not be loaded. Refresh and try again.' })
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ error: 'The file is no longer available. Choose the file again.' })
    }

    if (action === 'rename') {
      if (typeof filenameBase !== 'string' || !filenameBase.trim()) {
        return res.status(400).json({ error: 'Please enter a file name.' })
      }

      const nextFilename = buildRenamedFilename(file.filename, filenameBase)
      const nextPath = path.join(path.dirname(file.path), nextFilename)

      if (nextPath !== file.path && fs.existsSync(nextPath)) {
        return res.status(409).json({ error: 'A file with that name already exists. Choose another name and try again.' })
      }

      if (nextPath === file.path) {
        return res.status(200).json({
          action,
          file: serializeCreativeFile(file),
          message: 'File name is already up to date.',
        })
      }

      fs.renameSync(file.path, nextPath)

      try {
        const updatedFile = await prisma.creativeFile.update({
          where: { id },
          data: {
            filename: nextFilename,
            path: nextPath,
          },
          include: { metadata: true },
        })

        return res.status(200).json({
          action,
          file: serializeCreativeFile(updatedFile),
          message: 'File renamed successfully.',
        })
      } catch (error) {
        if (fs.existsSync(nextPath) && !fs.existsSync(file.path)) {
          fs.renameSync(nextPath, file.path)
        }

        throw error
      }
    }

    const siblingFiles = await prisma.creativeFile.findMany({
      select: { filename: true },
    })
    const duplicateFilename = buildDuplicateFilename(
      file.filename,
      siblingFiles.map((entry) => entry.filename),
    )
    const duplicatePath = path.join(path.dirname(file.path), duplicateFilename)

    fs.copyFileSync(file.path, duplicatePath, fs.constants.COPYFILE_EXCL)

    try {
      const stats = fs.statSync(duplicatePath)
      const duplicatedFile = await prisma.creativeFile.create({
        data: {
          filename: duplicateFilename,
          path: duplicatePath,
          type: file.type,
          size: BigInt(stats.size),
          mimeType: file.mimeType,
          metadata: file.metadata
            ? {
                create: {
                  type: file.metadata.type,
                  status: file.metadata.status,
                  tags: file.metadata.tags,
                  notes: file.metadata.notes ?? '',
                },
              }
            : undefined,
        },
        include: {
          metadata: true,
        },
      })

      return res.status(200).json({
        action,
        file: serializeCreativeFile(duplicatedFile),
        message: 'File duplicated successfully.',
      })
    } catch (error) {
      if (fs.existsSync(duplicatePath)) {
        fs.unlinkSync(duplicatePath)
      }

      throw error
    }
  } catch (error) {
    console.error('File Action Error:', error)
    const message =
      error instanceof Error && error.message === 'This item could not be loaded. Refresh and try again.'
        ? error.message
        : getFilesystemErrorMessage(error)

    if (message === 'Storage folder is unavailable. Check the local storage path and try again.') {
      return res.status(500).json({ error: message })
    }

    if (
      message === 'Permission denied. Check folder permissions and try again.' ||
      message === 'Storage is full. Free up space and try again.'
    ) {
      return res.status(500).json({ error: message })
    }

    return res.status(500).json({ error: 'Failed to save your changes. Try again.' })
  }
}
