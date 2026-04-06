import { z } from 'zod'

/**
 * Common reusable Zod schemas for validation across the application
 */

// Base ID validation - UUIDs
export const IDSchema = z.string().uuid('Invalid ID format')

// Date validation
export const DateSchema = z.coerce.date()

// File types (from fileValidation config)
export const FileTypeSchema = z.enum(['image', 'video', 'document', 'audio', 'other'])

// Status types for files and projects
export const FileStatusSchema = z.enum(['Draft', 'Published', 'Archived', 'Deleted'])

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string().min(1, 'Error message is required'),
  code: z.string().optional(),
  timestamp: DateSchema.optional(),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  total: z.number().int().nonnegative().optional(),
  totalPages: z.number().int().nonnegative().optional(),
})

export type Pagination = z.infer<typeof PaginationSchema>

// Common metadata schema
export const MetadataSchema = z.object({
  tags: z.array(z.string()).max(20, 'Maximum 20 tags allowed'),
  notes: z.string().max(500, 'Notes must be under 500 characters').optional(),
  createdAt: DateSchema.optional(),
  updatedAt: DateSchema.optional(),
})

export type Metadata = z.infer<typeof MetadataSchema>
