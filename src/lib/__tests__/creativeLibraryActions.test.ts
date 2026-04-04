import {
  buildDuplicateFilename,
  buildLibraryBreadcrumbs,
  buildRenamedFilename,
  splitFilename,
} from '../creativeLibraryActions'

describe('creativeLibraryActions', () => {
  describe('splitFilename', () => {
    it('splits filenames with extensions', () => {
      expect(splitFilename('launch.png')).toEqual({
        basename: 'launch',
        extension: '.png',
      })
    })

    it('keeps extension empty when none exists', () => {
      expect(splitFilename('README')).toEqual({
        basename: 'README',
        extension: '',
      })
    })
  })

  describe('buildRenamedFilename', () => {
    it('preserves the existing extension while sanitizing the requested name', () => {
      expect(buildRenamedFilename('launch-banner.png', 'Hero Banner!')).toBe('Hero_Banner_.png')
    })

    it('returns the current filename when the requested basename is empty', () => {
      expect(buildRenamedFilename('launch-banner.png', '   ')).toBe('launch-banner.png')
    })
  })

  describe('buildDuplicateFilename', () => {
    it('creates the first duplicate suffix when no prior copy exists', () => {
      expect(buildDuplicateFilename('launch.png', ['launch.png'])).toBe('launch-copy.png')
    })

    it('increments the duplicate suffix when earlier copies already exist', () => {
      expect(
        buildDuplicateFilename('launch.png', ['launch.png', 'launch-copy.png', 'launch-copy-2.png']),
      ).toBe('launch-copy-3.png')
    })
  })

  describe('buildLibraryBreadcrumbs', () => {
    it('builds a baseline breadcrumb trail for the unfiltered view', () => {
      expect(
        buildLibraryBreadcrumbs({
          searchTerm: '',
          typeFilter: 'all',
          statusFilter: 'all',
        }),
      ).toEqual(['Library', 'All assets'])
    })

    it('includes filters and selected file context when present', () => {
      expect(
        buildLibraryBreadcrumbs({
          searchTerm: 'launch',
          typeFilter: 'image',
          statusFilter: 'Approved',
          selectedFilename: 'launch-copy.png',
        }),
      ).toEqual(['Library', 'Image', 'Approved', 'Search: launch', 'launch-copy.png'])
    })
  })
})
