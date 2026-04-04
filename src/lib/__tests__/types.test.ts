/**
 * TypeScript Types Validation Tests
 * Verify that interfaces match requirements and compile correctly
 */

import type {
  CreativeFile,
  FileMetadata,
  PersistedFileMetadata,
  FileVersion,
  SyncMetadata,
  ApiResponse,
} from '@/lib/types'
import {
  parseFileMetadataTags,
  serializeFileMetadataTags,
  toAppFileMetadata,
  toPersistedFileMetadata,
} from '@/lib/types'
import type {
  CreativeFile as PrismaCreativeFile,
  FileMetadata as PrismaFileMetadata,
  FileVersion as PrismaFileVersion,
  SyncMetadata as PrismaSyncMetadata,
} from '@prisma/client'

type IsExact<T, U> =
  (<G>() => G extends T ? 1 : 2) extends
  (<G>() => G extends U ? 1 : 2)
    ? (<G>() => G extends U ? 1 : 2) extends
      (<G>() => G extends T ? 1 : 2)
      ? true
      : false
    : false

const creativeFileParity: IsExact<CreativeFile, PrismaCreativeFile> = true
const persistedFileMetadataParity: IsExact<PersistedFileMetadata, PrismaFileMetadata> = true
const fileVersionParity: IsExact<FileVersion, PrismaFileVersion> = true
const syncMetadataParity: IsExact<SyncMetadata, PrismaSyncMetadata> = true

describe('TypeScript Types', () => {
  describe('CreativeFile Interface', () => {
    it('should have all required CreativeFile fields', () => {
      const creativeFile: CreativeFile = {
        id: 'file-1',
        path: '/files/test.psd',
        filename: 'test.psd',
        type: 'psd',
        size: BigInt(1024000),
        mimeType: 'image/vnd.adobe.photoshop',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(creativeFile.id).toBeDefined()
      expect(creativeFile.filename).toBe('test.psd')
      expect(creativeFile.size).toBe(BigInt(1024000))
      expect(Object.keys(creativeFile).sort()).toEqual(
        ['createdAt', 'filename', 'id', 'mimeType', 'path', 'size', 'type', 'updatedAt'].sort()
      )
    })
  })

  describe('FileMetadata Interface', () => {
    it('should have all required FileMetadata fields', () => {
      const metadata: FileMetadata = {
        id: 'meta-1',
        fileId: 'file-1',
        type: 'image',
        status: 'Draft',
        tags: ['tag-1', 'tag-2'],
        notes: 'Metadata notes',
        updatedAt: new Date(),
      }

      expect(metadata.id).toBeDefined()
      expect(metadata.fileId).toBe('file-1')
      expect(metadata.tags).toEqual(['tag-1', 'tag-2'])
    })
  })

  describe('FileVersion Interface', () => {
    it('should have all required FileVersion fields', () => {
      const version: FileVersion = {
        id: 'version-1',
        fileId: 'file-1',
        versionNum: 1,
        commitHash: 'abc123def456',
        message: 'feat: Upload test.psd (v1)',
        createdAt: new Date(),
      }

      expect(version.id).toBeDefined()
      expect(version.versionNum).toBe(1)
      expect(version.commitHash).toBe('abc123def456')
    })
  })

  describe('SyncMetadata Interface', () => {
    it('should have all required SyncMetadata fields', () => {
      const sync: SyncMetadata = {
        id: 'sync-1',
        lastSyncTime: null,
        syncStatus: 'pending',
        syncError: null,
        externalId: 'ext-1',
        externalSource: 'google-drive',
        createdAt: new Date(),
        updatedAt: new Date(),
        fileId: 'file-1',
      }

      expect(sync.id).toBeDefined()
      expect(sync.syncStatus).toBe('pending')
      expect(sync.fileId).toBe('file-1')
    })
  })

  describe('Schema parity', () => {
    it('should match the persisted Prisma schema types exactly where the app contract does not intentionally diverge', () => {
      expect(creativeFileParity).toBe(true)
      expect(persistedFileMetadataParity).toBe(true)
      expect(fileVersionParity).toBe(true)
      expect(syncMetadataParity).toBe(true)
    })
  })

  describe('FileMetadata tag boundary', () => {
    it('should expose tags as an array in the app contract', () => {
      const persisted: PersistedFileMetadata = {
        id: 'meta-1',
        fileId: 'file-1',
        type: 'image',
        status: 'Draft',
        tags: '["tag-1","tag-2"]',
        notes: 'Metadata notes',
        updatedAt: new Date(),
      }

      const metadata = toAppFileMetadata(persisted)

      expect(metadata.tags).toEqual(['tag-1', 'tag-2'])
    })

    it('should serialize app tags back to the persisted SQLite shape', () => {
      const metadata: FileMetadata = {
        id: 'meta-1',
        fileId: 'file-1',
        type: 'image',
        status: 'Draft',
        tags: ['brand', 'campaign'],
        notes: 'Metadata notes',
        updatedAt: new Date(),
      }

      const persisted = toPersistedFileMetadata(metadata)

      expect(persisted.tags).toBe('["brand","campaign"]')
    })

    it('should return an empty array when persisted tags are invalid JSON', () => {
      expect(parseFileMetadataTags('not-json')).toEqual([])
    })

    it('should serialize arrays with the helper used by the persistence bridge', () => {
      expect(serializeFileMetadataTags(['tag-1', 'tag-2'])).toBe('["tag-1","tag-2"]')
    })
  })

  describe('ApiResponse Interface', () => {
    it('should wrap data correctly', () => {
      const response: ApiResponse<string> = {
        success: true,
        data: 'test',
      }

      expect(response.success).toBe(true)
      expect(response.data).toBe('test')
    })
  })
})
