import prisma from '../prisma'

describe('Prisma CRUD Operations', () => {
  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('CreativeFile Model', () => {
    it('should create a creative file record', async () => {
      const creativeFile = await prisma.creativeFile.create({
        data: {
          path: '/files/test.psd',
          filename: 'test.psd',
          type: 'psd',
          size: BigInt(1024000),
          mimeType: 'image/vnd.adobe.photoshop',
        },
      })

      expect(creativeFile).toBeDefined()
      expect(creativeFile.filename).toBe('test.psd')
      expect(creativeFile.type).toBe('psd')
      expect(creativeFile.size).toBe(BigInt(1024000))

      await prisma.creativeFile.delete({ where: { id: creativeFile.id } })
    })

    it('should read a creative file record', async () => {
      const created = await prisma.creativeFile.create({
        data: {
          path: '/files/read.png',
          filename: 'read.png',
          type: 'png',
          size: BigInt(512000),
          mimeType: 'image/png',
        },
      })

      const read = await prisma.creativeFile.findUnique({
        where: { id: created.id },
      })

      expect(read).toBeDefined()
      expect(read?.id).toBe(created.id)
      expect(read?.filename).toBe('read.png')

      await prisma.creativeFile.delete({ where: { id: created.id } })
    })

    it('should update a creative file record', async () => {
      const created = await prisma.creativeFile.create({
        data: {
          path: '/files/update.jpg',
          filename: 'update.jpg',
          type: 'jpg',
          size: BigInt(256000),
          mimeType: 'image/jpeg',
        },
      })

      const updated = await prisma.creativeFile.update({
        where: { id: created.id },
        data: { size: BigInt(512000), filename: 'updated.jpg' },
      })

      expect(updated.size).toBe(BigInt(512000))
      expect(updated.filename).toBe('updated.jpg')

      await prisma.creativeFile.delete({ where: { id: created.id } })
    })

    it('should delete a creative file record', async () => {
      const created = await prisma.creativeFile.create({
        data: {
          path: '/files/delete.mp4',
          filename: 'delete.mp4',
          type: 'mp4',
          size: BigInt(2048000),
          mimeType: 'video/mp4',
        },
      })

      await prisma.creativeFile.delete({ where: { id: created.id } })

      const deleted = await prisma.creativeFile.findUnique({
        where: { id: created.id },
      })

      expect(deleted).toBeNull()
    })
  })

  describe('FileMetadata Model', () => {
    it('should create metadata for a creative file', async () => {
      const creativeFile = await prisma.creativeFile.create({
        data: {
          path: '/files/metadata.psd',
          filename: 'metadata.psd',
          type: 'psd',
          size: BigInt(1024000),
          mimeType: 'image/vnd.adobe.photoshop',
        },
      })

      const metadata = await prisma.fileMetadata.create({
        data: {
          fileId: creativeFile.id,
          type: 'image',
          status: 'Draft',
          tags: '["test","metadata","brand"]',
          notes: 'Test metadata notes',
        },
      })

      expect(metadata).toBeDefined()
      expect(metadata.fileId).toBe(creativeFile.id)
      expect(metadata.status).toBe('Draft')

      await prisma.creativeFile.delete({ where: { id: creativeFile.id } })
    })

    it('should read metadata', async () => {
      const creativeFile = await prisma.creativeFile.create({
        data: {
          path: '/files/metadata-read.psd',
          filename: 'metadata-read.psd',
          type: 'psd',
          size: BigInt(1024000),
          mimeType: 'image/vnd.adobe.photoshop',
        },
      })

      const metadata = await prisma.fileMetadata.create({
        data: {
          fileId: creativeFile.id,
          type: 'image',
          status: 'In Review',
          tags: '["read","test"]',
          notes: 'Read test',
        },
      })

      const read = await prisma.fileMetadata.findUnique({
        where: { id: metadata.id },
      })

      expect(read?.notes).toBe('Read test')
      expect(read?.tags).toBe('["read","test"]')

      await prisma.creativeFile.delete({ where: { id: creativeFile.id } })
    })

    it('should update metadata', async () => {
      const creativeFile = await prisma.creativeFile.create({
        data: {
          path: '/files/metadata-update.psd',
          filename: 'metadata-update.psd',
          type: 'psd',
          size: BigInt(1024000),
          mimeType: 'image/vnd.adobe.photoshop',
        },
      })

      const metadata = await prisma.fileMetadata.create({
        data: {
          fileId: creativeFile.id,
          type: 'image',
          status: 'Draft',
          tags: '[]',
          notes: 'Original notes',
        },
      })

      const updated = await prisma.fileMetadata.update({
        where: { id: metadata.id },
        data: { status: 'Approved', notes: 'Updated notes' },
      })

      expect(updated.status).toBe('Approved')
      expect(updated.notes).toBe('Updated notes')

      await prisma.creativeFile.delete({ where: { id: creativeFile.id } })
    })

    it('should delete metadata', async () => {
      const creativeFile = await prisma.creativeFile.create({
        data: {
          path: '/files/metadata-delete.psd',
          filename: 'metadata-delete.psd',
          type: 'psd',
          size: BigInt(1024000),
          mimeType: 'image/vnd.adobe.photoshop',
        },
      })

      const metadata = await prisma.fileMetadata.create({
        data: {
          fileId: creativeFile.id,
          type: 'image',
          status: 'Draft',
          tags: '[]',
        },
      })

      await prisma.fileMetadata.delete({ where: { id: metadata.id } })

      const deleted = await prisma.fileMetadata.findUnique({
        where: { id: metadata.id },
      })

      expect(deleted).toBeNull()

      await prisma.creativeFile.delete({ where: { id: creativeFile.id } })
    })
  })

  describe('FileVersion Model', () => {
    it('should create a version record', async () => {
      const creativeFile = await prisma.creativeFile.create({
        data: {
          path: '/files/version.psd',
          filename: 'version.psd',
          type: 'psd',
          size: BigInt(1024000),
          mimeType: 'image/vnd.adobe.photoshop',
        },
      })

      const version = await prisma.fileVersion.create({
        data: {
          fileId: creativeFile.id,
          versionNum: 1,
          commitHash: 'abc123def456',
          message: 'feat: Upload version.psd (v1)',
        },
      })

      expect(version).toBeDefined()
      expect(version.versionNum).toBe(1)
      expect(version.commitHash).toBe('abc123def456')

      await prisma.creativeFile.delete({ where: { id: creativeFile.id } })
    })

    it('should read a version record', async () => {
      const creativeFile = await prisma.creativeFile.create({
        data: {
          path: '/files/version-read.psd',
          filename: 'version-read.psd',
          type: 'psd',
          size: BigInt(1024000),
          mimeType: 'image/vnd.adobe.photoshop',
        },
      })

      const version = await prisma.fileVersion.create({
        data: {
          fileId: creativeFile.id,
          versionNum: 2,
          commitHash: 'def456ghi789',
          message: 'docs: Update version-read.psd metadata',
        },
      })

      const read = await prisma.fileVersion.findUnique({
        where: { id: version.id },
      })

      expect(read?.versionNum).toBe(2)
      expect(read?.message).toBe('docs: Update version-read.psd metadata')

      await prisma.creativeFile.delete({ where: { id: creativeFile.id } })
    })

    it('should update a version record', async () => {
      const creativeFile = await prisma.creativeFile.create({
        data: {
          path: '/files/version-update.psd',
          filename: 'version-update.psd',
          type: 'psd',
          size: BigInt(1024000),
          mimeType: 'image/vnd.adobe.photoshop',
        },
      })

      const version = await prisma.fileVersion.create({
        data: {
          fileId: creativeFile.id,
          versionNum: 1,
          commitHash: 'ghi789jkl012',
          message: 'Original version message',
        },
      })

      const updated = await prisma.fileVersion.update({
        where: { id: version.id },
        data: { message: 'Updated version message' },
      })

      expect(updated.message).toBe('Updated version message')

      await prisma.creativeFile.delete({ where: { id: creativeFile.id } })
    })

    it('should delete a version record', async () => {
      const creativeFile = await prisma.creativeFile.create({
        data: {
          path: '/files/version-delete.psd',
          filename: 'version-delete.psd',
          type: 'psd',
          size: BigInt(1024000),
          mimeType: 'image/vnd.adobe.photoshop',
        },
      })

      const version = await prisma.fileVersion.create({
        data: {
          fileId: creativeFile.id,
          versionNum: 1,
          commitHash: 'jkl012mno345',
          message: 'To be deleted',
        },
      })

      await prisma.fileVersion.delete({ where: { id: version.id } })

      const deleted = await prisma.fileVersion.findUnique({
        where: { id: version.id },
      })

      expect(deleted).toBeNull()

      await prisma.creativeFile.delete({ where: { id: creativeFile.id } })
    })
  })

  describe('SyncMetadata Model', () => {
    it('should create sync metadata', async () => {
      const creativeFile = await prisma.creativeFile.create({
        data: {
          path: '/files/sync.psd',
          filename: 'sync.psd',
          type: 'psd',
          size: BigInt(1024000),
          mimeType: 'image/vnd.adobe.photoshop',
        },
      })

      const sync = await prisma.syncMetadata.create({
        data: {
          syncStatus: 'synced',
          externalId: 'ext-123',
          externalSource: 'dropbox',
          fileId: creativeFile.id,
        },
      })

      expect(sync).toBeDefined()
      expect(sync.syncStatus).toBe('synced')
      expect(sync.externalSource).toBe('dropbox')

      await prisma.creativeFile.delete({ where: { id: creativeFile.id } })
    })

    it('should read sync metadata', async () => {
      const creativeFile = await prisma.creativeFile.create({
        data: {
          path: '/files/sync-read.psd',
          filename: 'sync-read.psd',
          type: 'psd',
          size: BigInt(1024000),
          mimeType: 'image/vnd.adobe.photoshop',
        },
      })

      const sync = await prisma.syncMetadata.create({
        data: {
          syncStatus: 'pending',
          externalId: 'ext-456',
          externalSource: 'google-drive',
          fileId: creativeFile.id,
        },
      })

      const read = await prisma.syncMetadata.findUnique({
        where: { id: sync.id },
      })

      expect(read?.syncStatus).toBe('pending')
      expect(read?.externalSource).toBe('google-drive')

      await prisma.creativeFile.delete({ where: { id: creativeFile.id } })
    })

    it('should update sync metadata', async () => {
      const creativeFile = await prisma.creativeFile.create({
        data: {
          path: '/files/sync-update.psd',
          filename: 'sync-update.psd',
          type: 'psd',
          size: BigInt(1024000),
          mimeType: 'image/vnd.adobe.photoshop',
        },
      })

      const sync = await prisma.syncMetadata.create({
        data: {
          syncStatus: 'pending',
          fileId: creativeFile.id,
        },
      })

      const updated = await prisma.syncMetadata.update({
        where: { id: sync.id },
        data: { syncStatus: 'synced' },
      })

      expect(updated.syncStatus).toBe('synced')

      await prisma.creativeFile.delete({ where: { id: creativeFile.id } })
    })

    it('should delete sync metadata', async () => {
      const creativeFile = await prisma.creativeFile.create({
        data: {
          path: '/files/sync-delete.psd',
          filename: 'sync-delete.psd',
          type: 'psd',
          size: BigInt(1024000),
          mimeType: 'image/vnd.adobe.photoshop',
        },
      })

      const sync = await prisma.syncMetadata.create({
        data: {
          syncStatus: 'syncing',
          fileId: creativeFile.id,
        },
      })

      await prisma.syncMetadata.delete({ where: { id: sync.id } })

      const deleted = await prisma.syncMetadata.findUnique({
        where: { id: sync.id },
      })

      expect(deleted).toBeNull()

      await prisma.creativeFile.delete({ where: { id: creativeFile.id } })
    })
  })
})
