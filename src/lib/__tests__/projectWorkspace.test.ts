import {
  buildProjectTag,
  buildScopeTag,
  hasTag,
  getTaggedValue,
  buildWorkspaceTags,
  buildProjectWorkspaceActivityMessage,
  ensureProjectScopeDirectory,
  buildProjectWorkspaceWhere,
} from '../projectWorkspace'
import * as storageRoot from '../storageRoot'
import fs from 'fs'
import path from 'path'

jest.mock('../storageRoot', () => ({
  ensureStorageRoot: jest.fn(),
  STORAGE_ROOT: '/storage',
}))

jest.mock('fs')
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((...args) => args.join('/')),
}))

describe('projectWorkspace utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('buildProjectTag', () => {
    it('should build project tag with correct format', () => {
      const tag = buildProjectTag('proj-123')
      expect(tag).toBe('project-proj-123')
    })

    it('should handle different project IDs', () => {
      expect(buildProjectTag('proj-1')).toBe('project-proj-1')
      expect(buildProjectTag('my-project')).toBe('project-my-project')
      expect(buildProjectTag('a')).toBe('project-a')
    })
  })

  describe('buildScopeTag', () => {
    it('should build scope tag with correct format', () => {
      const tag = buildScopeTag('media')
      expect(tag).toBe('scope:media')
    })

    it('should work with all scope types', () => {
      const scopes = [
        'strategy',
        'media',
        'social',
        'config',
        'copy',
        'brand-core',
        'social-assets',
        'creative-production',
        'copy-messaging',
      ]

      scopes.forEach((scope) => {
        const tag = buildScopeTag(scope as any)
        expect(tag).toBe(`scope:${scope}`)
      })
    })
  })

  describe('hasTag', () => {
    it('should return true when tag exists', () => {
      const tags = ['project-proj-123', 'scope:media', 'status:approved']
      expect(hasTag(tags, 'scope:media')).toBe(true)
    })

    it('should return false when tag does not exist', () => {
      const tags = ['project-proj-123', 'scope:media']
      expect(hasTag(tags, 'scope:social')).toBe(false)
    })

    it('should handle empty tag list', () => {
      expect(hasTag([], 'scope:media')).toBe(false)
    })

    it('should be case sensitive', () => {
      const tags = ['scope:media']
      expect(hasTag(tags, 'SCOPE:MEDIA')).toBe(false)
    })

    it('should require exact match', () => {
      const tags = ['scope:media']
      expect(hasTag(tags, 'scope:med')).toBe(false)
    })
  })

  describe('getTaggedValue', () => {
    it('should extract value from tagged string', () => {
      const tags = ['project-proj-123', 'scope:media', 'status:approved']
      expect(getTaggedValue(tags, 'status:')).toBe('approved')
    })

    it('should return null when prefix not found', () => {
      const tags = ['project-proj-123', 'scope:media']
      expect(getTaggedValue(tags, 'status:')).toBeNull()
    })

    it('should work with different prefixes', () => {
      const tags = ['copy-type:headline', 'angle:emotional', 'audience:millennials']
      expect(getTaggedValue(tags, 'copy-type:')).toBe('headline')
      expect(getTaggedValue(tags, 'angle:')).toBe('emotional')
      expect(getTaggedValue(tags, 'audience:')).toBe('millennials')
    })

    it('should return full value after prefix', () => {
      const tags = ['project-proj-123-special']
      expect(getTaggedValue(tags, 'project-')).toBe('proj-123-special')
    })

    it('should handle empty value', () => {
      const tags = ['status:']
      expect(getTaggedValue(tags, 'status:')).toBe('')
    })

    it('should return null for empty tag list', () => {
      expect(getTaggedValue([], 'scope:')).toBeNull()
    })

    it('should find first matching tag', () => {
      const tags = ['scope:media', 'scope:social']
      expect(getTaggedValue(tags, 'scope:')).toBe('media')
    })
  })

  describe('buildWorkspaceTags', () => {
    it('should build tags with project and scope', () => {
      const tags = buildWorkspaceTags('proj-123', 'media')
      expect(tags).toContain('project-proj-123')
      expect(tags).toContain('scope:media')
    })

    it('should include extra tags', () => {
      const tags = buildWorkspaceTags('proj-123', 'copy', ['status:approved', 'priority:high'])
      expect(tags).toContain('project-proj-123')
      expect(tags).toContain('scope:copy')
      expect(tags).toContain('status:approved')
      expect(tags).toContain('priority:high')
    })

    it('should work with no extra tags', () => {
      const tags = buildWorkspaceTags('proj-123', 'social')
      expect(tags).toHaveLength(2)
      expect(tags).toEqual(['project-proj-123', 'scope:social'])
    })

    it('should maintain tag order', () => {
      const tags = buildWorkspaceTags('proj-1', 'media', ['tag1', 'tag2'])
      expect(tags[0]).toBe('project-proj-1')
      expect(tags[1]).toBe('scope:media')
      expect(tags[2]).toBe('tag1')
      expect(tags[3]).toBe('tag2')
    })

    it('should work with all scope types', () => {
      const scopes = [
        'strategy',
        'media',
        'social',
        'config',
        'copy',
        'brand-core',
        'social-assets',
        'creative-production',
        'copy-messaging',
      ]

      scopes.forEach((scope) => {
        const tags = buildWorkspaceTags('proj-123', scope as any)
        expect(tags).toContain(`scope:${scope}`)
      })
    })
  })

  describe('buildProjectWorkspaceActivityMessage', () => {
    it('should build message with filename and scope', () => {
      const message = buildProjectWorkspaceActivityMessage({
        filename: 'logo.png',
        scope: 'brand-core',
        status: null,
      })

      expect(message).toContain('logo.png')
      expect(message).toContain('brand core')
      expect(message).toContain('atualizado em')
    })

    it('should include status when provided', () => {
      const message = buildProjectWorkspaceActivityMessage({
        filename: 'banner.jpg',
        scope: 'media',
        status: 'Approved',
      })

      expect(message).toContain('(Approved)')
    })

    it('should not include status when null', () => {
      const message = buildProjectWorkspaceActivityMessage({
        filename: 'file.txt',
        scope: 'config',
        status: null,
      })

      expect(message).not.toContain('(')
    })

    it('should translate strategy scope', () => {
      const message = buildProjectWorkspaceActivityMessage({
        filename: 'strategy.md',
        scope: 'strategy',
        status: null,
      })

      expect(message).toContain('estrategia')
    })

    it('should translate media scope', () => {
      const message = buildProjectWorkspaceActivityMessage({
        filename: 'photo.jpg',
        scope: 'media',
        status: null,
      })

      expect(message).toContain('midia')
    })

    it('should translate social scope', () => {
      const message = buildProjectWorkspaceActivityMessage({
        filename: 'post.mp4',
        scope: 'social',
        status: null,
      })

      expect(message).toContain('social')
    })

    it('should translate social-assets scope', () => {
      const message = buildProjectWorkspaceActivityMessage({
        filename: 'asset.png',
        scope: 'social-assets',
        status: null,
      })

      expect(message).toContain('social assets')
    })

    it('should translate brand-core scope', () => {
      const message = buildProjectWorkspaceActivityMessage({
        filename: 'core.pdf',
        scope: 'brand-core',
        status: null,
      })

      expect(message).toContain('brand core')
    })

    it('should translate creative-production scope', () => {
      const message = buildProjectWorkspaceActivityMessage({
        filename: 'production.ai',
        scope: 'creative-production',
        status: null,
      })

      expect(message).toContain('creative production')
    })

    it('should translate copy and copy-messaging as "copy"', () => {
      const messageCopy = buildProjectWorkspaceActivityMessage({
        filename: 'copy.txt',
        scope: 'copy',
        status: null,
      })

      const messageCopyMessaging = buildProjectWorkspaceActivityMessage({
        filename: 'messaging.txt',
        scope: 'copy-messaging',
        status: null,
      })

      expect(messageCopy).toContain('copy')
      expect(messageCopyMessaging).toContain('copy')
    })

    it('should use "workspace" for unknown scope', () => {
      const message = buildProjectWorkspaceActivityMessage({
        filename: 'file.txt',
        scope: null,
        status: null,
      })

      expect(message).toContain('workspace')
    })
  })

  describe('ensureProjectScopeDirectory', () => {
    it('should ensure storage root', () => {
      ;(fs.mkdirSync as jest.Mock).mockImplementation(() => {})

      ensureProjectScopeDirectory('proj-123', 'media')

      expect(storageRoot.ensureStorageRoot).toHaveBeenCalledWith('/storage')
    })

    it('should create directory with recursive option', () => {
      ;(fs.mkdirSync as jest.Mock).mockImplementation(() => {})

      ensureProjectScopeDirectory('proj-123', 'media')

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.any(String),
        { recursive: true }
      )
    })

    it('should return directory path', () => {
      ;(fs.mkdirSync as jest.Mock).mockImplementation(() => {})

      const result = ensureProjectScopeDirectory('proj-123', 'media')

      expect(result).toContain('proj-123')
      expect(result).toContain('media')
    })

    it('should work with all scope types', () => {
      ;(fs.mkdirSync as jest.Mock).mockImplementation(() => {})

      const scopes = [
        'strategy',
        'media',
        'social',
        'config',
        'copy',
        'brand-core',
        'social-assets',
        'creative-production',
        'copy-messaging',
      ]

      scopes.forEach((scope) => {
        const result = ensureProjectScopeDirectory('proj-123', scope as any)
        expect(result).toContain(scope)
      })
    })
  })

  describe('buildProjectWorkspaceWhere', () => {
    it('should build where clause for all scopes', () => {
      const where = buildProjectWorkspaceWhere('proj-123', 'all')

      expect(where).toEqual({
        metadata: {
          tags: {
            contains: 'project-proj-123',
          },
        },
      })
    })

    it('should default to "all" scope', () => {
      const where = buildProjectWorkspaceWhere('proj-123')

      expect(where).toEqual({
        metadata: {
          tags: {
            contains: 'project-proj-123',
          },
        },
      })
    })

    it('should build where clause for specific scope', () => {
      const where = buildProjectWorkspaceWhere('proj-123', 'media')

      expect(where).toEqual({
        AND: [
          {
            metadata: {
              tags: {
                contains: 'project-proj-123',
              },
            },
          },
          {
            metadata: {
              tags: {
                contains: 'scope:media',
              },
            },
          },
        ],
      })
    })

    it('should work with all scope types', () => {
      const scopes = [
        'strategy',
        'social',
        'config',
        'copy',
        'brand-core',
        'social-assets',
        'creative-production',
        'copy-messaging',
      ]

      scopes.forEach((scope) => {
        const where = buildProjectWorkspaceWhere('proj-123', scope as any)
        expect(where.AND).toBeDefined()
        expect(where.AND![1].metadata.tags.contains).toContain(scope)
      })
    })
  })
})
