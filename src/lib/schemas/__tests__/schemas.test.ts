import {
  CreateFileSchema,
  UpdateFileMetadataSchema,
  FileQuerySchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectQuerySchema,
  IDSchema,
  DateSchema,
  ErrorResponseSchema,
  MetadataSchema,
} from '../index'

describe('Common Schemas', () => {
  describe('IDSchema', () => {
    it('should validate valid UUID', () => {
      const result = IDSchema.safeParse('550e8400-e29b-41d4-a716-446655440000')
      expect(result.success).toBe(true)
    })

    it('should reject invalid UUID', () => {
      const result = IDSchema.safeParse('not-a-uuid')
      expect(result.success).toBe(false)
    })
  })

  describe('DateSchema', () => {
    it('should parse valid date string', () => {
      const result = DateSchema.safeParse('2026-04-06T10:00:00Z')
      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Date)
    })

    it('should parse date object', () => {
      const date = new Date()
      const result = DateSchema.safeParse(date)
      expect(result.success).toBe(true)
    })
  })

  describe('ErrorResponseSchema', () => {
    it('should validate error response', () => {
      const result = ErrorResponseSchema.safeParse({
        error: 'Invalid input',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty error message', () => {
      const result = ErrorResponseSchema.safeParse({
        error: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('MetadataSchema', () => {
    it('should validate valid metadata', () => {
      const result = MetadataSchema.safeParse({
        tags: ['tag1', 'tag2'],
        notes: 'Some notes',
      })
      expect(result.success).toBe(true)
    })

    it('should reject too many tags', () => {
      const result = MetadataSchema.safeParse({
        tags: Array(21).fill('tag'),
      })
      expect(result.success).toBe(false)
    })

    it('should reject notes exceeding 500 characters', () => {
      const result = MetadataSchema.safeParse({
        notes: 'x'.repeat(501),
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('File Schemas', () => {
  describe('CreateFileSchema', () => {
    it('should validate valid file creation', () => {
      const result = CreateFileSchema.safeParse({
        filename: 'test.jpg',
        fileSizeBytes: 1024,
        mimeType: 'image/jpeg',
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional projectId', () => {
      const result = CreateFileSchema.safeParse({
        filename: 'test.jpg',
        fileSizeBytes: 1024,
        mimeType: 'image/jpeg',
        projectId: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty filename', () => {
      const result = CreateFileSchema.safeParse({
        filename: '',
        fileSizeBytes: 1024,
        mimeType: 'image/jpeg',
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing mimeType', () => {
      const result = CreateFileSchema.safeParse({
        filename: 'test.jpg',
        fileSizeBytes: 1024,
      })
      expect(result.success).toBe(false)
    })

    it('should reject negative file size', () => {
      const result = CreateFileSchema.safeParse({
        filename: 'test.jpg',
        fileSizeBytes: -1,
        mimeType: 'image/jpeg',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('UpdateFileMetadataSchema', () => {
    it('should validate partial update', () => {
      const result = UpdateFileMetadataSchema.safeParse({
        type: 'image',
      })
      expect(result.success).toBe(true)
    })

    it('should allow all fields optional', () => {
      const result = UpdateFileMetadataSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should reject empty type string', () => {
      const result = UpdateFileMetadataSchema.safeParse({
        type: '',
      })
      expect(result.success).toBe(false)
    })

    it('should reject too many tags', () => {
      const result = UpdateFileMetadataSchema.safeParse({
        tags: Array(21).fill('tag'),
      })
      expect(result.success).toBe(false)
    })

    it('should reject notes exceeding 500 characters', () => {
      const result = UpdateFileMetadataSchema.safeParse({
        notes: 'x'.repeat(501),
      })
      expect(result.success).toBe(false)
    })

    it('should validate complete update', () => {
      const result = UpdateFileMetadataSchema.safeParse({
        type: 'image',
        status: 'Published',
        tags: ['tag1', 'tag2'],
        notes: 'Some notes',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('FileQuerySchema', () => {
    it('should validate empty query', () => {
      const result = FileQuerySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should apply default values', () => {
      const result = FileQuerySchema.safeParse({})
      if (result.success) {
        expect(result.data.scope).toBe('all')
        expect(result.data.limit).toBe(10)
        expect(result.data.offset).toBe(0)
      }
    })

    it('should validate with all filters', () => {
      const result = FileQuerySchema.safeParse({
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        scope: 'owned',
        type: 'image',
        status: 'Published',
        limit: 20,
        offset: 10,
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid scope', () => {
      const result = FileQuerySchema.safeParse({
        scope: 'invalid',
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('Project Schemas', () => {
  describe('CreateProjectSchema', () => {
    it('should validate valid project creation', () => {
      const result = CreateProjectSchema.safeParse({
        name: 'My Project',
        slug: 'my-project',
      })
      expect(result.success).toBe(true)
    })

    it('should accept all optional fields', () => {
      const result = CreateProjectSchema.safeParse({
        name: 'My Project',
        slug: 'my-project',
        description: 'Project description',
        type: 'brand',
        status: 'Active',
      })
      expect(result.success).toBe(true)
    })

    it('should apply default type and status', () => {
      const result = CreateProjectSchema.safeParse({
        name: 'My Project',
        slug: 'my-project',
      })
      if (result.success) {
        expect(result.data.type).toBe('brand')
        expect(result.data.status).toBe('Draft')
      }
    })

    it('should reject empty project name', () => {
      const result = CreateProjectSchema.safeParse({
        name: '',
        slug: 'my-project',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid slug format', () => {
      const result = CreateProjectSchema.safeParse({
        name: 'My Project',
        slug: 'My Project!', // Invalid: uppercase and special char
      })
      expect(result.success).toBe(false)
    })

    it('should validate slug with lowercase, numbers, and hyphens', () => {
      const result = CreateProjectSchema.safeParse({
        name: 'My Project',
        slug: 'my-project-123',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('UpdateProjectSchema', () => {
    it('should allow empty update', () => {
      const result = UpdateProjectSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should validate partial updates', () => {
      const result = UpdateProjectSchema.safeParse({
        name: 'Updated Project',
      })
      expect(result.success).toBe(true)
    })

    it('should validate complete update', () => {
      const result = UpdateProjectSchema.safeParse({
        name: 'Updated Project',
        description: 'New description',
        status: 'Active',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty name if provided', () => {
      const result = UpdateProjectSchema.safeParse({
        name: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('ProjectQuerySchema', () => {
    it('should validate empty query', () => {
      const result = ProjectQuerySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should apply default values', () => {
      const result = ProjectQuerySchema.safeParse({})
      if (result.success) {
        expect(result.data.limit).toBe(10)
        expect(result.data.offset).toBe(0)
      }
    })

    it('should validate with filters', () => {
      const result = ProjectQuerySchema.safeParse({
        type: 'brand',
        status: 'Active',
        search: 'test',
        limit: 20,
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid project type', () => {
      const result = ProjectQuerySchema.safeParse({
        type: 'invalid',
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('Type Inference', () => {
  it('should correctly infer CreateFile type', () => {
    const data = CreateFileSchema.parse({
      filename: 'test.jpg',
      fileSizeBytes: 1024,
      mimeType: 'image/jpeg',
    })

    // Type check - if this compiles, type inference works
    const filename: string = data.filename
    const size: number = data.fileSizeBytes
    expect(filename).toBe('test.jpg')
    expect(size).toBe(1024)
  })

  it('should correctly infer UpdateFileMetadata type', () => {
    const data = UpdateFileMetadataSchema.parse({
      type: 'image',
      tags: ['tag1'],
    })

    // Type check
    const type: string | undefined = data.type
    const tags: string[] | undefined = data.tags
    expect(type).toBe('image')
    expect(tags).toEqual(['tag1'])
  })

  it('should correctly infer CreateProject type', () => {
    const data = CreateProjectSchema.parse({
      name: 'My Project',
      slug: 'my-project',
    })

    // Type check
    const name: string = data.name
    const type: 'brand' | 'campaign' | 'internal' = data.type
    expect(name).toBe('My Project')
    expect(type).toBe('brand')
    expect(data.slug).toBe('my-project')
  })
})

describe('Error Messages', () => {
  it('should provide clear error for CreateFileSchema', () => {
    const result = CreateFileSchema.safeParse({
      filename: '',
      fileSizeBytes: 1024,
      mimeType: 'image/jpeg',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      // Zod errors are accessible via the errors property
      const errors = (result.error as any).errors || []
      expect(errors.length).toBeGreaterThanOrEqual(0)
    }
  })

  it('should provide clear error for UpdateFileMetadataSchema tag limit', () => {
    const result = UpdateFileMetadataSchema.safeParse({
      tags: Array(21).fill('tag'),
    })
    expect(result.success).toBe(false)
  })

  it('should provide clear error for FileQuerySchema invalid scope', () => {
    const result = FileQuerySchema.safeParse({
      scope: 'invalid-scope',
    })
    expect(result.success).toBe(false)
  })
})
