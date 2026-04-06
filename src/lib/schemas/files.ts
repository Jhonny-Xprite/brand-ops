import { z } from 'zod'
import { IDSchema, DateSchema, FileStatusSchema, MetadataSchema } from './common'

/**
 * File-related validation schemas
 * Used for API validation and React Hook Form integration
 */

// Create file schema - used in POST /api/files
export const CreateFileSchema = z.object({
  filename: z.string().min(1, 'Filename is required').max(255, 'Filename too long'),
  fileSizeBytes: z.number().int().positive('File size must be positive'),
  mimeType: z.string().min(1, 'MIME type is required'),
  projectId: z.string().optional(),
})

export type CreateFile = z.infer<typeof CreateFileSchema>

// Update file metadata schema - used in PATCH /api/files/[id]
export const UpdateFileMetadataSchema = z.object({
  type: z.string().min(1, 'Please select a file type.').optional(),
  status: z.string().min(1, 'Status is required.').optional(),
  tags: z.array(z.string()).max(20, 'You can add up to 20 tags.').optional(),
  notes: z.string().max(500, 'Notes can have up to 500 characters.').optional(),
})

export type UpdateFileMetadata = z.infer<typeof UpdateFileMetadataSchema>

// File query schema - used for filtering and pagination
export const FileQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  scope: z.enum(['all', 'owned', 'shared']).default('all'),
  type: z.string().optional(),
  status: FileStatusSchema.optional(),
  limit: z.number().int().positive().max(100).default(10),
  offset: z.number().int().nonnegative().default(0),
})

export type FileQuery = z.infer<typeof FileQuerySchema>

// Complete file schema (what's returned from API)
export const FileSchema = z.object({
  id: IDSchema,
  filename: z.string(),
  fileSizeBytes: z.number().int(),
  mimeType: z.string(),
  type: z.string(),
  status: FileStatusSchema,
  path: z.string(),
  projectId: z.string().uuid().optional(),
  metadata: MetadataSchema.optional(),
  createdAt: DateSchema,
  updatedAt: DateSchema,
})

export type File = z.infer<typeof FileSchema>

// File list response schema
export const FileListSchema = z.array(FileSchema)

export type FileList = z.infer<typeof FileListSchema>
