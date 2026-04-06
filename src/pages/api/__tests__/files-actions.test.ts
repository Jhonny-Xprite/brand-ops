import { NextApiRequest, NextApiResponse } from 'next'
import handler from '../files/[id]/actions'
import prisma from '@/lib/prisma'
import * as creativeFiles from '@/lib/creativeFiles'
import * as creativeLibraryActions from '@/lib/creativeLibraryActions'
import * as storageRoot from '@/lib/storageRoot'
import fs from 'fs'

jest.mock('@/lib/prisma', () => ({
  creativeFile: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
}))

jest.mock('@/lib/creativeFiles', () => ({
  serializeCreativeFile: jest.fn((file) => ({
    ...file,
    serialized: true,
  })),
}))

jest.mock('@/lib/creativeLibraryActions', () => ({
  buildRenamedFilename: jest.fn((filename, base) => `${base}.${filename.split('.').pop()}`),
  buildDuplicateFilename: jest.fn((filename, existing) => `${filename.replace(/\.[^.]+$/, '')}_copy.${filename.split('.').pop()}`),
}))

jest.mock('@/lib/storageRoot', () => ({
  getFilesystemErrorMessage: jest.fn((err) => 'Storage error'),
}))

jest.mock('fs')

jest.mock('path', () => {
  const realPath = jest.requireActual('path')
  return {
    ...realPath,
    dirname: jest.fn((p: string) => '/storage'),
    join: jest.fn((dir: string, file: string) => `${dir}/${file}`),
  }
})

describe('POST /api/files/[id]/actions', () => {
  let req: Partial<NextApiRequest>
  let res: Partial<NextApiResponse>
  let statusMock: jest.Mock
  let jsonMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    statusMock = jest.fn().mockReturnThis()
    jsonMock = jest.fn().mockReturnThis()

    req = {
      method: 'POST',
      query: { id: 'file-123' },
      body: {
        action: 'rename',
        filenameBase: 'new-name',
      },
    }

    res = {
      status: statusMock,
      json: jsonMock,
    }
  })

  describe('Validation', () => {
    it('should return 400 when ID is not a string', async () => {
      req.query = { id: ['file-1', 'file-2'] }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'ID invalido.' })
    })

    it('should return 405 for non-POST requests', async () => {
      req.method = 'GET'

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(405)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Metodo nao permitido.' })
    })

    it('should return 400 for invalid action', async () => {
      req.body = { action: 'invalid', filenameBase: 'test' }

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Acao de arquivo invalida.' })
    })

    it('should return 404 when file not found in database', async () => {
      ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(null)

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Nao foi possivel carregar este item. Atualize e tente novamente.',
      })
    })

    it('should return 404 when file path does not exist', async () => {
      const mockFile = {
        id: 'file-123',
        filename: 'test.jpg',
        path: '/storage/test.jpg',
        type: 'image',
        size: BigInt(1024),
        mimeType: 'image/jpeg',
        metadata: null,
      }

      ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'O arquivo nao esta mais disponivel. Selecione-o novamente.',
      })
    })
  })

  describe('Rename action', () => {
    const mockFile = {
      id: 'file-123',
      filename: 'test.jpg',
      path: '/storage/test.jpg',
      type: 'image',
      size: BigInt(1024),
      mimeType: 'image/jpeg',
      metadata: null,
    }

    beforeEach(() => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    })

    it('should return 400 when filenameBase is empty', async () => {
      req.body = { action: 'rename', filenameBase: '' }

      ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Informe um nome para o arquivo.',
      })
    })

    it('should return 400 when filenameBase is whitespace only', async () => {
      req.body = { action: 'rename', filenameBase: '   ' }

      ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Informe um nome para o arquivo.',
      })
    })

    it('should return 409 when target filename already exists', async () => {
      req.body = { action: 'rename', filenameBase: 'existing' }

      ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
      ;(fs.existsSync as jest.Mock).mockImplementation((filePath) => {
        return filePath === '/storage/existing.jpg' || filePath === mockFile.path
      })

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(409)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Ja existe um arquivo com esse nome. Escolha outro nome e tente novamente.',
      })
    })

    it('should return 200 when renaming to same name (idempotent)', async () => {
      req.body = { action: 'rename', filenameBase: 'test' }

      ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
      ;(creativeLibraryActions.buildRenamedFilename as jest.Mock).mockReturnValue('test.jpg')

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({
        action: 'rename',
        file: expect.any(Object),
        message: 'O nome do arquivo ja esta atualizado.',
      })
    })

    it('should rename file successfully', async () => {
      req.body = { action: 'rename', filenameBase: 'new-test' }

      const updatedFile = { ...mockFile, filename: 'new-test.jpg', path: '/storage/new-test.jpg' }

      ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
      ;(creativeLibraryActions.buildRenamedFilename as jest.Mock).mockReturnValue('new-test.jpg')
      ;(fs.existsSync as jest.Mock).mockImplementation((filePath) => filePath === mockFile.path)
      ;(fs.renameSync as jest.Mock).mockImplementation(() => {})
      ;(prisma.creativeFile.update as jest.Mock).mockResolvedValue(updatedFile)

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({
        action: 'rename',
        file: expect.any(Object),
        message: 'Arquivo renomeado com sucesso.',
      })
      expect(fs.renameSync).toHaveBeenCalledWith(mockFile.path, '/storage/new-test.jpg')
      expect(prisma.creativeFile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'file-123' },
          data: {
            filename: 'new-test.jpg',
            path: '/storage/new-test.jpg',
          },
        })
      )
    })

    it('should rollback filesystem on database error during rename', async () => {
      req.body = { action: 'rename', filenameBase: 'new-test' }

      ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
      ;(creativeLibraryActions.buildRenamedFilename as jest.Mock).mockReturnValue('new-test.jpg')
      ;(fs.existsSync as jest.Mock).mockImplementation((filePath) => filePath === mockFile.path)
      ;(fs.renameSync as jest.Mock).mockImplementation(() => {})
      ;(prisma.creativeFile.update as jest.Mock).mockRejectedValue(new Error('DB error'))

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      // fs.renameSync was called (at least once for the initial rename attempt)
      expect(fs.renameSync).toHaveBeenCalled()
    })
  })

  describe('Duplicate action', () => {
    const mockFile = {
      id: 'file-123',
      filename: 'original.jpg',
      path: '/storage/original.jpg',
      type: 'image',
      size: BigInt(1024),
      mimeType: 'image/jpeg',
      metadata: {
        type: 'image',
        status: 'active',
        tags: ['test'],
        notes: 'test file',
      },
    }

    beforeEach(() => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    })

    it('should duplicate file successfully', async () => {
      req.body = { action: 'duplicate' }

      const duplicateFile = {
        ...mockFile,
        id: 'file-456',
        filename: 'original_copy.jpg',
        path: '/storage/original_copy.jpg',
      }

      ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue([
        { filename: 'original.jpg' },
      ])
      ;(creativeLibraryActions.buildDuplicateFilename as jest.Mock).mockReturnValue('original_copy.jpg')
      ;(fs.copyFileSync as jest.Mock).mockImplementation(() => {})
      ;(fs.statSync as jest.Mock).mockReturnValue({ size: 1024 })
      ;(prisma.creativeFile.create as jest.Mock).mockResolvedValue(duplicateFile)

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({
        action: 'duplicate',
        file: expect.any(Object),
        message: 'Arquivo duplicado com sucesso.',
      })
      expect(fs.copyFileSync).toHaveBeenCalled()
      expect(prisma.creativeFile.create).toHaveBeenCalled()
    })

    it('should duplicate file without metadata', async () => {
      const fileWithoutMetadata = { ...mockFile, metadata: null }
      const duplicateFile = {
        ...fileWithoutMetadata,
        id: 'file-456',
        filename: 'original_copy.jpg',
      }

      req.body = { action: 'duplicate' }

      ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(fileWithoutMetadata)
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue([
        { filename: 'original.jpg' },
      ])
      ;(creativeLibraryActions.buildDuplicateFilename as jest.Mock).mockReturnValue('original_copy.jpg')
      ;(fs.copyFileSync as jest.Mock).mockImplementation(() => {})
      ;(fs.statSync as jest.Mock).mockReturnValue({ size: 1024 })
      ;(prisma.creativeFile.create as jest.Mock).mockResolvedValue(duplicateFile)

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(prisma.creativeFile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ metadata: { create: expect.anything() } }),
        })
      )
    })

    it('should cleanup duplicate file on database error', async () => {
      req.body = { action: 'duplicate' }

      ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue([
        { filename: 'original.jpg' },
      ])
      ;(creativeLibraryActions.buildDuplicateFilename as jest.Mock).mockReturnValue('original_copy.jpg')
      ;(fs.copyFileSync as jest.Mock).mockImplementation(() => {})
      ;(fs.statSync as jest.Mock).mockReturnValue({ size: 1024 })
      ;(prisma.creativeFile.create as jest.Mock).mockRejectedValue(new Error('DB error'))
      ;(fs.existsSync as jest.Mock).mockImplementation((filePath) => {
        // Make both files exist (copy was created but DB insert failed)
        return true
      })

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      // Cleanup should attempt to delete the temp file
      expect(fs.unlinkSync).toHaveBeenCalledWith('/storage/original_copy.jpg')
    })

    it('should handle duplicate file creation error when file already exists', async () => {
      req.body = { action: 'duplicate' }

      ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
      ;(prisma.creativeFile.findMany as jest.Mock).mockResolvedValue([
        { filename: 'original.jpg' },
      ])
      ;(creativeLibraryActions.buildDuplicateFilename as jest.Mock).mockReturnValue('original_copy.jpg')
      ;(fs.copyFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('EEXIST')
      })

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
    })
  })

  describe('Error handling', () => {
    const mockFile = {
      id: 'file-123',
      filename: 'test.jpg',
      path: '/storage/test.jpg',
      type: 'image',
      size: BigInt(1024),
      mimeType: 'image/jpeg',
      metadata: null,
    }

    it('should handle database error on file lookup', async () => {
      ;(prisma.creativeFile.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
    })

    it('should handle storage unavailable error', async () => {
      req.body = { action: 'rename', filenameBase: 'new-name' }

      ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
      ;(creativeLibraryActions.buildRenamedFilename as jest.Mock).mockReturnValue('new-name.jpg')
      ;(fs.existsSync as jest.Mock).mockImplementation((filePath) => {
        // Only current file exists, not the new target
        return filePath === mockFile.path
      })
      ;(fs.renameSync as jest.Mock).mockImplementation(() => {
        const error = new Error('ENOENT')
        ;(error as any).code = 'ENOENT'
        throw error
      })

      ;(storageRoot.getFilesystemErrorMessage as jest.Mock).mockReturnValue(
        'A pasta de armazenamento nao esta disponivel. Verifique o caminho local e tente novamente.'
      )

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
    })

    it('should handle permission denied error', async () => {
      req.body = { action: 'rename', filenameBase: 'new-name' }

      ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
      ;(creativeLibraryActions.buildRenamedFilename as jest.Mock).mockReturnValue('new-name.jpg')
      ;(fs.existsSync as jest.Mock).mockImplementation((filePath) => {
        // Only current file exists, not the new target
        return filePath === mockFile.path
      })
      ;(fs.renameSync as jest.Mock).mockImplementation(() => {
        const error = new Error('EACCES')
        ;(error as any).code = 'EACCES'
        throw error
      })

      ;(storageRoot.getFilesystemErrorMessage as jest.Mock).mockReturnValue(
        'Permissao negada. Verifique as permissoes da pasta e tente novamente.'
      )

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
    })

    it('should use generic error message for unknown filesystem errors', async () => {
      req.body = { action: 'rename', filenameBase: 'new-name' }

      ;(prisma.creativeFile.findUnique as jest.Mock).mockResolvedValue(mockFile)
      ;(creativeLibraryActions.buildRenamedFilename as jest.Mock).mockReturnValue('new-name.jpg')
      ;(fs.existsSync as jest.Mock).mockImplementation((filePath) => {
        // Only current file exists, not the new target
        return filePath === mockFile.path
      })
      ;(fs.renameSync as jest.Mock).mockImplementation(() => {
        throw new Error('Unknown filesystem error')
      })

      ;(storageRoot.getFilesystemErrorMessage as jest.Mock).mockReturnValue(
        'Unknown error'
      )

      await handler(req as NextApiRequest, res as NextApiResponse)

      expect(statusMock).toHaveBeenCalledWith(500)
      // The error message will be the one returned by getFilesystemErrorMessage
      expect(jsonMock).toHaveBeenCalledWith({
        error: expect.any(String),
      })
    })
  })
})
