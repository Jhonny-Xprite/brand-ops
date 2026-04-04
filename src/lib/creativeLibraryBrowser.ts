import type { CreativeFileWithMetadata } from '@/lib/types'

export type ViewMode = 'grid' | 'list'
export type SortOrder = 'newest' | 'oldest' | 'name-asc' | 'name-desc'

export interface BrowseFilters {
  searchTerm: string
  typeFilter: string
  statusFilter: string
  sortOrder: SortOrder
}

const DEFAULT_COLUMNS = 4

export function formatFileSize(size: bigint | string | number): string {
  const normalizedSize = typeof size === 'bigint' ? Number(size) : Number(size)

  if (Number.isNaN(normalizedSize) || normalizedSize < 1024) {
    return `${Math.max(0, normalizedSize || 0)} B`
  }

  if (normalizedSize < 1024 * 1024) {
    return `${(normalizedSize / 1024).toFixed(1)} KB`
  }

  if (normalizedSize < 1024 * 1024 * 1024) {
    return `${(normalizedSize / (1024 * 1024)).toFixed(1)} MB`
  }

  return `${(normalizedSize / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function getFileTypeLabel(type: string): string {
  switch (type) {
    case 'image':
      return 'IMG'
    case 'video':
      return 'VID'
    case 'carousel':
      return 'CAR'
    case 'document':
      return 'DOC'
    default:
      return 'FILE'
  }
}

export function filterAndSortFiles(
  files: CreativeFileWithMetadata[],
  { searchTerm, typeFilter, statusFilter, sortOrder }: BrowseFilters,
): CreativeFileWithMetadata[] {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filtered = files.filter((file) => {
    const fileType = file.metadata?.type ?? file.type
    const fileStatus = file.metadata?.status ?? 'Draft'
    const matchesSearch = normalizedSearch.length === 0 || file.filename.toLowerCase().includes(normalizedSearch)
    const matchesType = typeFilter === 'all' || fileType === typeFilter
    const matchesStatus = statusFilter === 'all' || fileStatus === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  return [...filtered].sort((left, right) => {
    if (sortOrder === 'name-asc') {
      return left.filename.localeCompare(right.filename)
    }

    if (sortOrder === 'name-desc') {
      return right.filename.localeCompare(left.filename)
    }

    const leftDate = new Date(left.createdAt).getTime()
    const rightDate = new Date(right.createdAt).getTime()

    return sortOrder === 'oldest' ? leftDate - rightDate : rightDate - leftDate
  })
}

export function getRangeSelection(
  orderedFileIds: string[],
  anchorId: string | null,
  targetId: string,
): string[] {
  if (!anchorId) {
    return [targetId]
  }

  const anchorIndex = orderedFileIds.indexOf(anchorId)
  const targetIndex = orderedFileIds.indexOf(targetId)

  if (anchorIndex === -1 || targetIndex === -1) {
    return [targetId]
  }

  const start = Math.min(anchorIndex, targetIndex)
  const end = Math.max(anchorIndex, targetIndex)

  return orderedFileIds.slice(start, end + 1)
}

export function getNextFocusIndex(
  currentIndex: number,
  key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown',
  totalItems: number,
  viewMode: ViewMode,
  gridColumns = DEFAULT_COLUMNS,
): number {
  if (totalItems === 0) {
    return -1
  }

  if (viewMode === 'list') {
    if (key === 'ArrowUp') {
      return Math.max(0, currentIndex - 1)
    }

    if (key === 'ArrowDown') {
      return Math.min(totalItems - 1, currentIndex + 1)
    }

    return currentIndex
  }

  switch (key) {
    case 'ArrowLeft':
      return Math.max(0, currentIndex - 1)
    case 'ArrowRight':
      return Math.min(totalItems - 1, currentIndex + 1)
    case 'ArrowUp':
      return Math.max(0, currentIndex - gridColumns)
    case 'ArrowDown':
      return Math.min(totalItems - 1, currentIndex + gridColumns)
    default:
      return currentIndex
  }
}

