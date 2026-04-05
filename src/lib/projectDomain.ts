export const BUSINESS_MODELS = ['INFOPRODUTO', 'ECOMMERCE', 'NEGOCIO_LOCAL'] as const

export type ProjectBusinessModel = (typeof BUSINESS_MODELS)[number]

export const PROJECT_LIBRARY_DOMAINS = [
  'BRAND_CORE',
  'STRATEGY',
  'SOCIAL_ASSETS',
  'CREATIVE_PRODUCTION',
  'COPY_MESSAGING',
] as const

export type ProjectLibraryDomain = (typeof PROJECT_LIBRARY_DOMAINS)[number]

export const PROJECT_LIBRARY_ITEM_KINDS = ['NOTE', 'FILE', 'LINK', 'PALETTE'] as const
export const PROJECT_LIBRARY_RELATION_TYPES = [
  'DRIVES',
  'USES',
  'DEPENDS_ON',
  'PUBLISHES_AS',
  'APPROVES',
] as const

export type ProjectLibraryItemKind = (typeof PROJECT_LIBRARY_ITEM_KINDS)[number]
export type ProjectLibraryRelationType = (typeof PROJECT_LIBRARY_RELATION_TYPES)[number]
export const CLIENT_BRAND_MODES = ['FULL_SHELL'] as const
export const SURFACE_STYLES = ['AURORA', 'GLASS', 'SOLID'] as const
export const VISUAL_DENSITIES = ['COMPACT', 'BALANCED', 'EDITORIAL'] as const
export const BRAND_TONES = ['LUXURY_STRATEGIC', 'PREMIUM_EDITORIAL', 'TECH_EXECUTIVE'] as const

export type ClientBrandMode = (typeof CLIENT_BRAND_MODES)[number]
export type SurfaceStyle = (typeof SURFACE_STYLES)[number]
export type VisualDensity = (typeof VISUAL_DENSITIES)[number]
export type BrandTone = (typeof BRAND_TONES)[number]

export interface ProjectSocialLinks {
  instagramUrl?: string
  youtubeUrl?: string
  facebookUrl?: string
  tiktokUrl?: string
}

export interface SerializedProjectLibraryItem {
  id: string
  projectId: string
  domain: ProjectLibraryDomain
  category: string
  title: string
  description?: string | null
  content?: string | null
  status: string
  kind: ProjectLibraryItemKind
  payload: Record<string, string | boolean | string[] | null>
  linkUrl?: string | null
  assetFileId?: string | null
  assetPreviewUrl?: string
  assetFilename?: string | null
  assetMimeType?: string | null
  isPrimary: boolean
  relatedItems: SerializedProjectLibraryRelation[]
  createdAt: string
  updatedAt: string
}

export interface SerializedProjectLibraryRelation {
  id: string
  relationType: ProjectLibraryRelationType
  targetItemId: string
  targetDomain: ProjectLibraryDomain
  targetCategory: string
  targetTitle: string
}

export function isBusinessModel(value: string): value is ProjectBusinessModel {
  return BUSINESS_MODELS.includes(value as ProjectBusinessModel)
}

export function isProjectLibraryDomain(value: string): value is ProjectLibraryDomain {
  return PROJECT_LIBRARY_DOMAINS.includes(value as ProjectLibraryDomain)
}

export function isProjectLibraryItemKind(value: string): value is ProjectLibraryItemKind {
  return PROJECT_LIBRARY_ITEM_KINDS.includes(value as ProjectLibraryItemKind)
}

export function isProjectLibraryRelationType(value: string): value is ProjectLibraryRelationType {
  return PROJECT_LIBRARY_RELATION_TYPES.includes(value as ProjectLibraryRelationType)
}

export function coerceBusinessModel(value: string): ProjectBusinessModel {
  return isBusinessModel(value) ? value : 'INFOPRODUTO'
}

export function coerceProjectLibraryDomain(value: string): ProjectLibraryDomain {
  return isProjectLibraryDomain(value) ? value : 'STRATEGY'
}

export function coerceProjectLibraryItemKind(value: string): ProjectLibraryItemKind {
  return isProjectLibraryItemKind(value) ? value : 'NOTE'
}

export function coerceProjectLibraryRelationType(value: string): ProjectLibraryRelationType {
  return isProjectLibraryRelationType(value) ? value : 'USES'
}

export function parseProjectLibraryPayload(
  payload: string,
): Record<string, string | boolean | string[] | null> {
  try {
    const parsed: unknown = JSON.parse(payload)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string | boolean | string[] | null>
    }

    return {}
  } catch {
    return {}
  }
}

export function serializeProjectLibraryPayload(
  payload?: Record<string, string | boolean | string[] | null> | null,
): string {
  return JSON.stringify(payload ?? {})
}

export function getBusinessModelLabel(model: ProjectBusinessModel): string {
  switch (model) {
    case 'INFOPRODUTO':
      return 'Infoproduto'
    case 'ECOMMERCE':
      return 'E-commerce'
    case 'NEGOCIO_LOCAL':
      return 'Negocio Local'
    default:
      return model
  }
}

export function getDomainUploadScope(domain: ProjectLibraryDomain) {
  switch (domain) {
    case 'BRAND_CORE':
      return 'brand-core'
    case 'SOCIAL_ASSETS':
      return 'social-assets'
    case 'CREATIVE_PRODUCTION':
      return 'creative-production'
    case 'COPY_MESSAGING':
      return 'copy-messaging'
    case 'STRATEGY':
    default:
      return 'strategy'
  }
}

export function getProjectLibraryRelationLabel(value: ProjectLibraryRelationType): string {
  switch (value) {
    case 'DRIVES':
      return 'Guia'
    case 'USES':
      return 'Usa'
    case 'DEPENDS_ON':
      return 'Depende de'
    case 'PUBLISHES_AS':
      return 'Publica como'
    case 'APPROVES':
      return 'Aprova'
    default:
      return value
  }
}

export function coerceClientBrandMode(value: string): ClientBrandMode {
  return CLIENT_BRAND_MODES.includes(value as ClientBrandMode) ? (value as ClientBrandMode) : 'FULL_SHELL'
}

export function coerceSurfaceStyle(value: string): SurfaceStyle {
  return SURFACE_STYLES.includes(value as SurfaceStyle) ? (value as SurfaceStyle) : 'AURORA'
}

export function coerceVisualDensity(value: string): VisualDensity {
  return VISUAL_DENSITIES.includes(value as VisualDensity) ? (value as VisualDensity) : 'BALANCED'
}

export function coerceBrandTone(value: string): BrandTone {
  return BRAND_TONES.includes(value as BrandTone) ? (value as BrandTone) : 'LUXURY_STRATEGIC'
}
