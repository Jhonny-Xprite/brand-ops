import { z } from 'zod'
import { IDSchema, DateSchema, MetadataSchema } from './common'

/**
 * Project-related validation schemas
 * Used for API validation and React Hook Form integration
 */

// Create project schema - used in POST /api/projects
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  type: z.enum(['brand', 'campaign', 'internal']).default('brand'),
  status: z.enum(['Active', 'Archived', 'Draft']).default('Draft'),
})

export type CreateProject = z.infer<typeof CreateProjectSchema>

// Update project schema - used in PATCH /api/projects/[id]
export const UpdateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.enum(['Active', 'Archived', 'Draft']).optional(),
})

export type UpdateProject = z.infer<typeof UpdateProjectSchema>

// Project query schema - used for filtering and pagination
export const ProjectQuerySchema = z.object({
  type: z.enum(['brand', 'campaign', 'internal']).optional(),
  status: z.enum(['Active', 'Archived', 'Draft']).optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(100).default(10),
  offset: z.number().int().nonnegative().default(0),
})

export type ProjectQuery = z.infer<typeof ProjectQuerySchema>

// Complete project schema (what's returned from API)
export const ProjectSchema = z.object({
  id: IDSchema,
  name: z.string(),
  description: z.string().optional(),
  slug: z.string(),
  type: z.enum(['brand', 'campaign', 'internal']),
  status: z.enum(['Active', 'Archived', 'Draft']),
  metadata: MetadataSchema.optional(),
  createdAt: DateSchema,
  updatedAt: DateSchema,
})

export type Project = z.infer<typeof ProjectSchema>

// Project list response schema
export const ProjectListSchema = z.array(ProjectSchema)

export type ProjectList = z.infer<typeof ProjectListSchema>
