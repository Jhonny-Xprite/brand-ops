/**
 * TypeScript Types Validation Tests
 * Verify that interfaces match requirements and compile correctly
 */

import type {
  Creative,
  Metadata,
  Version,
  SyncMetadata,
  ApiResponse,
} from '@/lib/types'

describe('TypeScript Types', () => {
  describe('Creative Interface', () => {
    it('should have all required Creative fields', () => {
      const creative: Creative = {
        id: 'creative-1',
        name: 'Test Creative',
        type: 'psd',
        path: '/files/test.psd',
        fileSize: 1024000,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(creative.id).toBeDefined()
      expect(creative.name).toBeDefined()
      expect(creative.type).toBeDefined()
    })
  })

  describe('Metadata Interface', () => {
    it('should have all required Metadata fields', () => {
      const metadata: Metadata = {
        id: 'meta-1',
        creativeId: 'creative-1',
        designer: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(metadata.id).toBeDefined()
      expect(metadata.creativeId).toBeDefined()
    })
  })

  describe('Version Interface', () => {
    it('should have all required Version fields', () => {
      const version: Version = {
        id: 'version-1',
        creativeId: 'creative-1',
        versionNumber: 1,
        createdAt: new Date(),
      }

      expect(version.id).toBeDefined()
      expect(version.versionNumber).toBeDefined()
    })
  })

  describe('SyncMetadata Interface', () => {
    it('should have all required SyncMetadata fields', () => {
      const sync: SyncMetadata = {
        id: 'sync-1',
        entityId: 'entity-1',
        isSynced: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(sync.id).toBeDefined()
      expect(sync.isSynced).toBeDefined()
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
