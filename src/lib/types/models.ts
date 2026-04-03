import type {
  CreativeFile as PrismaCreativeFile,
  FileMetadata as PrismaFileMetadata,
  FileVersion as PrismaFileVersion,
  SyncMetadata as PrismaSyncMetadata,
} from '@prisma/client'

/**
 * Data Models - TypeScript Interfaces
 * These interfaces intentionally mirror the persisted Prisma schema.
 */

/**
 * Creative file record.
 */
export interface CreativeFile {
  id: PrismaCreativeFile['id']
  path: PrismaCreativeFile['path']
  filename: PrismaCreativeFile['filename']
  type: PrismaCreativeFile['type']
  size: PrismaCreativeFile['size']
  mimeType: PrismaCreativeFile['mimeType']
  createdAt: PrismaCreativeFile['createdAt']
  updatedAt: PrismaCreativeFile['updatedAt']
}

/**
 * File metadata persisted for a creative file.
 * `tags` is exposed to the app as `string[]`.
 */
export interface FileMetadata {
  id: PrismaFileMetadata['id']
  fileId: PrismaFileMetadata['fileId']
  type: PrismaFileMetadata['type']
  status: PrismaFileMetadata['status']
  tags: string[]
  notes: PrismaFileMetadata['notes']
  updatedAt: PrismaFileMetadata['updatedAt']
}

/**
 * Persisted Prisma/SQLite representation for file metadata.
 * `tags` remains a JSON-encoded string in storage.
 */
export interface PersistedFileMetadata {
  id: PrismaFileMetadata['id']
  fileId: PrismaFileMetadata['fileId']
  type: PrismaFileMetadata['type']
  status: PrismaFileMetadata['status']
  tags: PrismaFileMetadata['tags']
  notes: PrismaFileMetadata['notes']
  updatedAt: PrismaFileMetadata['updatedAt']
}

/**
 * Convert JSON-encoded tag storage into the app-level array contract.
 */
export function parseFileMetadataTags(tags: PersistedFileMetadata['tags']): FileMetadata['tags'] {
  try {
    const parsed: unknown = JSON.parse(tags)
    return Array.isArray(parsed) && parsed.every((tag) => typeof tag === 'string') ? parsed : []
  } catch {
    return []
  }
}

/**
 * Convert app-level tag arrays into the persisted SQLite representation.
 */
export function serializeFileMetadataTags(tags: FileMetadata['tags']): PersistedFileMetadata['tags'] {
  return JSON.stringify(tags)
}

/**
 * Bridge the persisted Prisma shape to the app-facing contract.
 */
export function toAppFileMetadata(metadata: PersistedFileMetadata): FileMetadata {
  return {
    ...metadata,
    tags: parseFileMetadataTags(metadata.tags),
  }
}

/**
 * Bridge the app-facing contract back to the persisted Prisma/SQLite shape.
 */
export function toPersistedFileMetadata(metadata: FileMetadata): PersistedFileMetadata {
  return {
    ...metadata,
    tags: serializeFileMetadataTags(metadata.tags),
  }
}

/**
 * Immutable version history entry.
 */
export interface FileVersion {
  id: PrismaFileVersion['id']
  fileId: PrismaFileVersion['fileId']
  versionNum: PrismaFileVersion['versionNum']
  commitHash: PrismaFileVersion['commitHash']
  message: PrismaFileVersion['message']
  createdAt: PrismaFileVersion['createdAt']
}

/**
 * Sync state persisted for later sync/versioning flows.
 */
export interface SyncMetadata {
  id: PrismaSyncMetadata['id']
  lastSyncTime: PrismaSyncMetadata['lastSyncTime']
  syncStatus: PrismaSyncMetadata['syncStatus']
  syncError: PrismaSyncMetadata['syncError']
  externalId: PrismaSyncMetadata['externalId']
  externalSource: PrismaSyncMetadata['externalSource']
  createdAt: PrismaSyncMetadata['createdAt']
  updatedAt: PrismaSyncMetadata['updatedAt']
  fileId: PrismaSyncMetadata['fileId']
}

/**
 * API Response Wrapper
 * Standard response format for all API endpoints
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Pagination
 * Standard pagination parameters and response
 */
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}

/**
 * Filter Options
 * Common filtering parameters
 */
export interface FilterOptions {
  search?: string
  tags?: string[]
  status?: string
  startDate?: Date
  endDate?: Date
  [key: string]: unknown
}
