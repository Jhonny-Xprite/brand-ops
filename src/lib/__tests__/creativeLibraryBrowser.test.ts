import {
  filterAndSortFiles,
  formatFileSize,
  getFileTypeLabel,
  getNextFocusIndex,
  getRangeSelection,
  type BrowseFilters,
} from '@/lib/creativeLibraryBrowser'
import type { CreativeFileWithMetadata } from '@/lib/types'

const files: CreativeFileWithMetadata[] = [
  {
    id: 'file-1',
    path: 'E:\\BRAND-OPS-STORAGE\\alpha.png',
    filename: 'alpha.png',
    type: 'image',
    size: BigInt(1024),
    mimeType: 'image/png',
    createdAt: new Date('2026-04-03T10:00:00.000Z'),
    updatedAt: new Date('2026-04-03T10:00:00.000Z'),
    metadata: {
      id: 'meta-1',
      fileId: 'file-1',
      type: 'image',
      status: 'Approved',
      tags: ['hero'],
      notes: 'Alpha asset',
      updatedAt: new Date('2026-04-03T10:00:00.000Z'),
    },
  },
  {
    id: 'file-2',
    path: 'E:\\BRAND-OPS-STORAGE\\beta.mp4',
    filename: 'beta.mp4',
    type: 'video',
    size: BigInt(4096),
    mimeType: 'video/mp4',
    createdAt: new Date('2026-04-04T10:00:00.000Z'),
    updatedAt: new Date('2026-04-04T10:00:00.000Z'),
    metadata: {
      id: 'meta-2',
      fileId: 'file-2',
      type: 'video',
      status: 'Draft',
      tags: ['campaign'],
      notes: 'Beta asset',
      updatedAt: new Date('2026-04-04T10:00:00.000Z'),
    },
  },
  {
    id: 'file-3',
    path: 'E:\\BRAND-OPS-STORAGE\\gamma.pdf',
    filename: 'gamma.pdf',
    type: 'document',
    size: BigInt(2048),
    mimeType: 'application/pdf',
    createdAt: new Date('2026-04-02T10:00:00.000Z'),
    updatedAt: new Date('2026-04-02T10:00:00.000Z'),
    metadata: {
      id: 'meta-3',
      fileId: 'file-3',
      type: 'document',
      status: 'In Review',
      tags: ['proof'],
      notes: 'Gamma asset',
      updatedAt: new Date('2026-04-02T10:00:00.000Z'),
    },
  },
]

const defaultFilters: BrowseFilters = {
  searchTerm: '',
  typeFilter: 'all',
  statusFilter: 'all',
  sortOrder: 'newest',
}

describe('creativeLibraryBrowser', () => {
  it('filters by filename search, type, and status', () => {
    const filtered = filterAndSortFiles(files, {
      ...defaultFilters,
      searchTerm: 'gam',
      typeFilter: 'document',
      statusFilter: 'In Review',
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.id).toBe('file-3')
  })

  it('sorts files by name ascending', () => {
    const filtered = filterAndSortFiles(files, {
      ...defaultFilters,
      sortOrder: 'name-asc',
    })

    expect(filtered.map((file) => file.filename)).toEqual(['alpha.png', 'beta.mp4', 'gamma.pdf'])
  })

  it('returns a range selection from anchor to target', () => {
    expect(getRangeSelection(['file-1', 'file-2', 'file-3'], 'file-1', 'file-3')).toEqual([
      'file-1',
      'file-2',
      'file-3',
    ])
  })

  it('calculates next focus index for grid navigation', () => {
    expect(getNextFocusIndex(0, 'ArrowRight', 8, 'grid')).toBe(1)
    expect(getNextFocusIndex(1, 'ArrowDown', 8, 'grid')).toBe(5)
  })

  it('formats file sizes and type labels for the shell UI', () => {
    expect(formatFileSize(BigInt(2048))).toBe('2.0 KB')
    expect(getFileTypeLabel('video')).toBe('VID')
  })
})
