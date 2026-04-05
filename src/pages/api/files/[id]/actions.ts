import fs from 'fs'
import path from 'path'
import { NextApiRequest, NextApiResponse } from 'next'

import { serializeCreativeFile } from '@/lib/creativeFiles'
import { buildDuplicateFilename, buildRenamedFilename } from '@/lib/creativeLibraryActions'
import prisma from '@/lib/prisma'
import { getFilesystemErrorMessage } from '@/lib/storageRoot'

interface ActionResponse {
  action: 'rename' | 'duplicate'
  file: ReturnType<typeof serializeCreativeFile>
  message: string
}

interface ActionError {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ActionResponse | ActionError>,
) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'ID invalido.' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo nao permitido.' })
  }

  const { action, filenameBase } = req.body as {
    action?: 'rename' | 'duplicate'
    filenameBase?: string
  }

  if (action !== 'rename' && action !== 'duplicate') {
    return res.status(400).json({ error: 'Acao de arquivo invalida.' })
  }

  try {
    const file = await prisma.creativeFile.findUnique({
      where: { id },
      include: { metadata: true },
    })

    if (!file) {
      return res.status(404).json({ error: 'Nao foi possivel carregar este item. Atualize e tente novamente.' })
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ error: 'O arquivo nao esta mais disponivel. Selecione-o novamente.' })
    }

    if (action === 'rename') {
      if (typeof filenameBase !== 'string' || !filenameBase.trim()) {
        return res.status(400).json({ error: 'Informe um nome para o arquivo.' })
      }

      const nextFilename = buildRenamedFilename(file.filename, filenameBase)
      const nextPath = path.join(path.dirname(file.path), nextFilename)

      if (nextPath !== file.path && fs.existsSync(nextPath)) {
        return res.status(409).json({ error: 'Ja existe um arquivo com esse nome. Escolha outro nome e tente novamente.' })
      }

      if (nextPath === file.path) {
        return res.status(200).json({
          action,
          file: serializeCreativeFile(file),
          message: 'O nome do arquivo ja esta atualizado.',
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
          message: 'Arquivo renomeado com sucesso.',
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
        message: 'Arquivo duplicado com sucesso.',
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
      error instanceof Error && error.message === 'Nao foi possivel carregar este item. Atualize e tente novamente.'
        ? error.message
        : getFilesystemErrorMessage(error)

    if (message === 'A pasta de armazenamento nao esta disponivel. Verifique o caminho local e tente novamente.') {
      return res.status(500).json({ error: message })
    }

    if (
      message === 'Permissao negada. Verifique as permissoes da pasta e tente novamente.' ||
      message === 'O armazenamento esta cheio. Libere espaco e tente novamente.'
    ) {
      return res.status(500).json({ error: message })
    }

    return res.status(500).json({ error: 'Nao foi possivel salvar suas alteracoes. Tente novamente.' })
  }
}
