/**
 * Data Models - TypeScript Interfaces
 * Mirrors Prisma schema from Story 0.1
 */

/**
 * Creative Asset
 * Represents creative files (PSD, PNG, JPG, MP4, etc)
 */
export interface Creative {
  id: string
  name: string
  type: string // 'psd', 'png', 'jpg', 'mp4', etc
  path: string // File system path
  fileSize: number // Size in bytes
  mimeType?: string // MIME type (optional)
  status?: 'active' | 'archived' | 'draft' // Asset status
  tags?: string[] // Search tags
  notes?: string // Additional notes
  createdAt: Date
  updatedAt: Date
}

/**
 * Metadata
 * Stores additional information about creative assets
 */
export interface Metadata {
  id: string
  creativeId: string // Foreign key to Creative
  designer?: string // Designer name
  campaign?: string // Campaign/project name
  targetAudience?: string // Target audience description
  format?: string // Format specifications (dimensions, duration, etc)
  customFields?: Record<string, unknown> // Extensible custom fields
  createdAt: Date
  updatedAt: Date
}

/**
 * Version
 * Tracks version history of creative assets
 */
export interface Version {
  id: string
  creativeId: string // Foreign key to Creative
  versionNumber: number // Version number (1, 2, 3, etc)
  commitHash?: string // Git commit hash (if applicable)
  message?: string // Commit/version message
  createdAt: Date
}

/**
 * SyncMetadata
 * Tracks synchronization status with external services
 */
export interface SyncMetadata {
  id: string
  entityId: string // ID of synced entity (creative or other)
  lastSyncAt?: Date // Last synchronization timestamp
  syncHash?: string // Hash of last sync state
  isSynced: boolean // Current sync status
  externalId?: string // ID in external system
  externalSource?: string // External source (dropbox, google-drive, etc)
  createdAt: Date
  updatedAt: Date
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
