import prisma from '../prisma'

describe('Prisma CRUD Operations', () => {
  // Clean up after all tests
  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Creative Model', () => {
    it('should create a creative record', async () => {
      const creative = await prisma.creative.create({
        data: {
          name: 'Test Creative PSD',
          type: 'psd',
          path: '/files/test.psd',
          fileSize: 1024000,
        },
      })

      expect(creative).toBeDefined()
      expect(creative.name).toBe('Test Creative PSD')
      expect(creative.type).toBe('psd')
      expect(creative.fileSize).toBe(1024000)

      // Cleanup
      await prisma.creative.delete({ where: { id: creative.id } })
    })

    it('should read a creative record', async () => {
      const created = await prisma.creative.create({
        data: {
          name: 'Test Creative for Read',
          type: 'png',
          path: '/files/test.png',
          fileSize: 512000,
        },
      })

      const read = await prisma.creative.findUnique({
        where: { id: created.id },
      })

      expect(read).toBeDefined()
      expect(read?.id).toBe(created.id)
      expect(read?.name).toBe('Test Creative for Read')

      // Cleanup
      await prisma.creative.delete({ where: { id: created.id } })
    })

    it('should update a creative record', async () => {
      const created = await prisma.creative.create({
        data: {
          name: 'Test Creative for Update',
          type: 'jpg',
          path: '/files/test.jpg',
          fileSize: 256000,
        },
      })

      const updated = await prisma.creative.update({
        where: { id: created.id },
        data: { fileSize: 512000, name: 'Updated Name' },
      })

      expect(updated.fileSize).toBe(512000)
      expect(updated.name).toBe('Updated Name')

      // Cleanup
      await prisma.creative.delete({ where: { id: created.id } })
    })

    it('should delete a creative record', async () => {
      const created = await prisma.creative.create({
        data: {
          name: 'Test Creative for Delete',
          type: 'mp4',
          path: '/files/test.mp4',
          fileSize: 2048000,
        },
      })

      await prisma.creative.delete({ where: { id: created.id } })

      const deleted = await prisma.creative.findUnique({
        where: { id: created.id },
      })

      expect(deleted).toBeNull()
    })
  })

  describe('Metadata Model', () => {
    it('should create metadata for a creative', async () => {
      const creative = await prisma.creative.create({
        data: {
          name: 'Test with Metadata',
          type: 'psd',
          path: '/files/test.psd',
          fileSize: 1024000,
        },
      })

      const metadata = await prisma.metadata.create({
        data: {
          description: 'Test metadata description',
          tags: 'test,metadata,brand',
          properties: JSON.stringify({ color: 'red' }),
          creativeId: creative.id,
        },
      })

      expect(metadata).toBeDefined()
      expect(metadata.description).toBe('Test metadata description')
      expect(metadata.creativeId).toBe(creative.id)

      // Cleanup (cascade delete)
      await prisma.creative.delete({ where: { id: creative.id } })
    })

    it('should read metadata', async () => {
      const creative = await prisma.creative.create({
        data: {
          name: 'Test with Metadata Read',
          type: 'psd',
          path: '/files/test.psd',
          fileSize: 1024000,
        },
      })

      const metadata = await prisma.metadata.create({
        data: {
          description: 'Read test',
          tags: 'read,test',
          creativeId: creative.id,
        },
      })

      const read = await prisma.metadata.findUnique({
        where: { id: metadata.id },
      })

      expect(read?.description).toBe('Read test')
      expect(read?.tags).toBe('read,test')

      // Cleanup
      await prisma.creative.delete({ where: { id: creative.id } })
    })

    it('should update metadata', async () => {
      const creative = await prisma.creative.create({
        data: {
          name: 'Test with Metadata Update',
          type: 'psd',
          path: '/files/test.psd',
          fileSize: 1024000,
        },
      })

      const metadata = await prisma.metadata.create({
        data: {
          description: 'Original description',
          creativeId: creative.id,
        },
      })

      const updated = await prisma.metadata.update({
        where: { id: metadata.id },
        data: { description: 'Updated description' },
      })

      expect(updated.description).toBe('Updated description')

      // Cleanup
      await prisma.creative.delete({ where: { id: creative.id } })
    })

    it('should delete metadata', async () => {
      const creative = await prisma.creative.create({
        data: {
          name: 'Test with Metadata Delete',
          type: 'psd',
          path: '/files/test.psd',
          fileSize: 1024000,
        },
      })

      const metadata = await prisma.metadata.create({
        data: {
          description: 'To be deleted',
          creativeId: creative.id,
        },
      })

      await prisma.metadata.delete({ where: { id: metadata.id } })

      const deleted = await prisma.metadata.findUnique({
        where: { id: metadata.id },
      })

      expect(deleted).toBeNull()

      // Cleanup
      await prisma.creative.delete({ where: { id: creative.id } })
    })
  })

  describe('Version Model', () => {
    it('should create a version record', async () => {
      const creative = await prisma.creative.create({
        data: {
          name: 'Test with Version',
          type: 'psd',
          path: '/files/test.psd',
          fileSize: 1024000,
        },
      })

      const version = await prisma.version.create({
        data: {
          versionNumber: 1,
          changes: 'Initial version',
          creativeId: creative.id,
        },
      })

      expect(version).toBeDefined()
      expect(version.versionNumber).toBe(1)
      expect(version.changes).toBe('Initial version')

      // Cleanup
      await prisma.creative.delete({ where: { id: creative.id } })
    })

    it('should read a version record', async () => {
      const creative = await prisma.creative.create({
        data: {
          name: 'Test Version Read',
          type: 'psd',
          path: '/files/test.psd',
          fileSize: 1024000,
        },
      })

      const version = await prisma.version.create({
        data: {
          versionNumber: 2,
          changes: 'Version 2 changes',
          creativeId: creative.id,
        },
      })

      const read = await prisma.version.findUnique({
        where: { id: version.id },
      })

      expect(read?.versionNumber).toBe(2)
      expect(read?.changes).toBe('Version 2 changes')

      // Cleanup
      await prisma.creative.delete({ where: { id: creative.id } })
    })

    it('should update a version record', async () => {
      const creative = await prisma.creative.create({
        data: {
          name: 'Test Version Update',
          type: 'psd',
          path: '/files/test.psd',
          fileSize: 1024000,
        },
      })

      const version = await prisma.version.create({
        data: {
          versionNumber: 1,
          changes: 'Original changes',
          creativeId: creative.id,
        },
      })

      const updated = await prisma.version.update({
        where: { id: version.id },
        data: { changes: 'Updated changes' },
      })

      expect(updated.changes).toBe('Updated changes')

      // Cleanup
      await prisma.creative.delete({ where: { id: creative.id } })
    })

    it('should delete a version record', async () => {
      const creative = await prisma.creative.create({
        data: {
          name: 'Test Version Delete',
          type: 'psd',
          path: '/files/test.psd',
          fileSize: 1024000,
        },
      })

      const version = await prisma.version.create({
        data: {
          versionNumber: 1,
          changes: 'To be deleted',
          creativeId: creative.id,
        },
      })

      await prisma.version.delete({ where: { id: version.id } })

      const deleted = await prisma.version.findUnique({
        where: { id: version.id },
      })

      expect(deleted).toBeNull()

      // Cleanup
      await prisma.creative.delete({ where: { id: creative.id } })
    })
  })

  describe('SyncMetadata Model', () => {
    it('should create sync metadata', async () => {
      const creative = await prisma.creative.create({
        data: {
          name: 'Test with SyncMetadata',
          type: 'psd',
          path: '/files/test.psd',
          fileSize: 1024000,
        },
      })

      const sync = await prisma.syncMetadata.create({
        data: {
          syncStatus: 'synced',
          externalId: 'ext-123',
          externalSource: 'dropbox',
          creativeId: creative.id,
        },
      })

      expect(sync).toBeDefined()
      expect(sync.syncStatus).toBe('synced')
      expect(sync.externalSource).toBe('dropbox')

      // Cleanup
      await prisma.creative.delete({ where: { id: creative.id } })
    })

    it('should read sync metadata', async () => {
      const creative = await prisma.creative.create({
        data: {
          name: 'Test SyncMetadata Read',
          type: 'psd',
          path: '/files/test.psd',
          fileSize: 1024000,
        },
      })

      const sync = await prisma.syncMetadata.create({
        data: {
          syncStatus: 'pending',
          externalId: 'ext-456',
          externalSource: 'google-drive',
          creativeId: creative.id,
        },
      })

      const read = await prisma.syncMetadata.findUnique({
        where: { id: sync.id },
      })

      expect(read?.syncStatus).toBe('pending')
      expect(read?.externalSource).toBe('google-drive')

      // Cleanup
      await prisma.creative.delete({ where: { id: creative.id } })
    })

    it('should update sync metadata', async () => {
      const creative = await prisma.creative.create({
        data: {
          name: 'Test SyncMetadata Update',
          type: 'psd',
          path: '/files/test.psd',
          fileSize: 1024000,
        },
      })

      const sync = await prisma.syncMetadata.create({
        data: {
          syncStatus: 'pending',
          creativeId: creative.id,
        },
      })

      const updated = await prisma.syncMetadata.update({
        where: { id: sync.id },
        data: { syncStatus: 'synced' },
      })

      expect(updated.syncStatus).toBe('synced')

      // Cleanup
      await prisma.creative.delete({ where: { id: creative.id } })
    })

    it('should delete sync metadata', async () => {
      const creative = await prisma.creative.create({
        data: {
          name: 'Test SyncMetadata Delete',
          type: 'psd',
          path: '/files/test.psd',
          fileSize: 1024000,
        },
      })

      const sync = await prisma.syncMetadata.create({
        data: {
          syncStatus: 'syncing',
          creativeId: creative.id,
        },
      })

      await prisma.syncMetadata.delete({ where: { id: sync.id } })

      const deleted = await prisma.syncMetadata.findUnique({
        where: { id: sync.id },
      })

      expect(deleted).toBeNull()

      // Cleanup
      await prisma.creative.delete({ where: { id: creative.id } })
    })
  })
})
