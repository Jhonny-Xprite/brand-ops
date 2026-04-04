import { sanitizeFilename } from '@/lib/fileUtils'

export interface LibraryBreadcrumbOptions {
  searchTerm: string
  typeFilter: string
  statusFilter: string
  selectedFilename?: string | null
}

export function splitFilename(filename: string): { basename: string; extension: string } {
  const lastDotIndex = filename.lastIndexOf('.')

  if (lastDotIndex <= 0) {
    return {
      basename: filename,
      extension: '',
    }
  }

  return {
    basename: filename.slice(0, lastDotIndex),
    extension: filename.slice(lastDotIndex),
  }
}

export function buildRenamedFilename(currentFilename: string, requestedBasename: string): string {
  const { extension } = splitFilename(currentFilename)
  const sanitizedBasename = sanitizeFilename(requestedBasename.trim()).replace(/\.[^.]+$/, '')

  if (!sanitizedBasename) {
    return currentFilename
  }

  return `${sanitizedBasename}${extension}`
}

export function buildDuplicateFilename(filename: string, existingFilenames: string[]): string {
  const { basename, extension } = splitFilename(filename)
  const normalizedExisting = new Set(existingFilenames.map((name) => name.toLowerCase()))

  let candidate = `${basename}-copy${extension}`
  let counter = 2

  while (normalizedExisting.has(candidate.toLowerCase())) {
    candidate = `${basename}-copy-${counter}${extension}`
    counter += 1
  }

  return candidate
}

export function buildLibraryBreadcrumbs({
  searchTerm,
  typeFilter,
  statusFilter,
  selectedFilename,
}: LibraryBreadcrumbOptions): string[] {
  const breadcrumbs = ['Library']

  if (typeFilter !== 'all') {
    breadcrumbs.push(typeFilter[0]?.toUpperCase() + typeFilter.slice(1))
  }

  if (statusFilter !== 'all') {
    breadcrumbs.push(statusFilter)
  }

  if (searchTerm.trim()) {
    breadcrumbs.push(`Search: ${searchTerm.trim()}`)
  }

  if (selectedFilename) {
    breadcrumbs.push(selectedFilename)
  } else if (breadcrumbs.length === 1) {
    breadcrumbs.push('All assets')
  }

  return breadcrumbs
}
