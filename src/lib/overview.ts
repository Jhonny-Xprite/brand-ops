import type { ProjectLibraryDomain, ProjectLibraryItemKind, ProjectLibraryRelationType } from '@/lib/projectDomain'

export type OverviewSourceType = 'FILE' | 'LIBRARY_ITEM'
export type OverviewSourceDomain = 'MEDIA_LIBRARY' | ProjectLibraryDomain

export interface OverviewEntryRelation {
  id: string
  relationType: ProjectLibraryRelationType
  targetItemId: string
  targetDomain: OverviewSourceDomain
  targetCategory: string
  targetTitle: string
}

export interface OverviewEntry {
  id: string
  sourceType: OverviewSourceType
  sourceDomain: OverviewSourceDomain
  category: string
  title: string
  description?: string | null
  status: string
  kind: ProjectLibraryItemKind | 'MEDIA_FILE'
  previewUrl?: string
  filename?: string
  mimeType?: string | null
  tags?: string[]
  relations: OverviewEntryRelation[]
  createdAt: string
  updatedAt: string
  originHref: string
  canRename: boolean
  canDuplicate: boolean
  canEditInline: boolean
  payload: Record<string, string | boolean | string[] | null>
}

export const OVERVIEW_DOMAIN_OPTIONS: Array<{ value: OverviewSourceDomain | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Todos os dominios' },
  { value: 'MEDIA_LIBRARY', label: 'Media' },
  { value: 'STRATEGY', label: 'Strategy' },
  { value: 'BRAND_CORE', label: 'Brand Core' },
  { value: 'SOCIAL_ASSETS', label: 'Social' },
  { value: 'CREATIVE_PRODUCTION', label: 'Production' },
  { value: 'COPY_MESSAGING', label: 'Copy' },
]

export function getOverviewDomainLabel(domain: OverviewSourceDomain): string {
  switch (domain) {
    case 'MEDIA_LIBRARY':
      return 'Media Library'
    case 'STRATEGY':
      return 'Strategy Library'
    case 'BRAND_CORE':
      return 'Brand Core'
    case 'SOCIAL_ASSETS':
      return 'Social Assets'
    case 'CREATIVE_PRODUCTION':
      return 'Creative Production'
    case 'COPY_MESSAGING':
      return 'Copy & Messaging'
    default:
      return domain
  }
}

export function getOverviewOriginHref(projectId: string, domain: OverviewSourceDomain): string {
  switch (domain) {
    case 'MEDIA_LIBRARY':
      return `/projeto/${projectId}/media`
    case 'STRATEGY':
      return `/projeto/${projectId}/strategy`
    case 'BRAND_CORE':
      return `/projeto/${projectId}/brand-core`
    case 'SOCIAL_ASSETS':
      return `/projeto/${projectId}/social`
    case 'CREATIVE_PRODUCTION':
      return `/projeto/${projectId}/production`
    case 'COPY_MESSAGING':
      return `/projeto/${projectId}/copy`
    default:
      return `/projeto/${projectId}/overview`
  }
}

export function getOverviewEntrySearchBlob(entry: OverviewEntry): string {
  return [
    entry.title,
    entry.description,
    entry.filename,
    entry.category,
    ...(entry.tags ?? []),
    ...Object.values(entry.payload).flatMap((value) => (Array.isArray(value) ? value : [value])),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}
