import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpenText,
  BriefcaseBusiness,
  CheckCircle2,
  CircleEllipsis,
  CircleOff,
  Clapperboard,
  Cog,
  CopyPlus,
  Gauge,
  Grip,
  ImagePlus,
  Images,
  Info,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'

export const APP_ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
} as const

export type AppIconSize = keyof typeof APP_ICON_SIZES
export type AppIconTone =
  | 'default'
  | 'muted'
  | 'active'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

export type AppIconName =
  | 'overview'
  | 'dashboard'
  | 'strategy'
  | 'brandCore'
  | 'media'
  | 'social'
  | 'production'
  | 'copy'
  | 'config'
  | 'switchProject'
  | 'search'
  | 'create'
  | 'duplicate'
  | 'properties'
  | 'clearSelection'
  | 'warning'
  | 'error'
  | 'success'
  | 'info'
  | 'governance'

export const APP_ICON_MAP: Record<AppIconName, LucideIcon> = {
  overview: Grip,
  dashboard: Gauge,
  strategy: BriefcaseBusiness,
  brandCore: Palette,
  media: Images,
  social: Sparkles,
  production: Clapperboard,
  copy: BookOpenText,
  config: Cog,
  switchProject: ArrowLeftRight,
  search: Search,
  create: ImagePlus,
  duplicate: CopyPlus,
  properties: CircleEllipsis,
  clearSelection: CircleOff,
  warning: TriangleAlert,
  error: AlertTriangle,
  success: CheckCircle2,
  info: Info,
  governance: ShieldCheck,
}

export type DomainIconName =
  | 'OVERVIEW'
  | 'DASHBOARD'
  | 'STRATEGY'
  | 'BRAND_CORE'
  | 'MEDIA'
  | 'SOCIAL'
  | 'PRODUCTION'
  | 'COPY'
  | 'CONFIG'

export const DOMAIN_ICON_MAP: Record<DomainIconName, AppIconName> = {
  OVERVIEW: 'overview',
  DASHBOARD: 'dashboard',
  STRATEGY: 'strategy',
  BRAND_CORE: 'brandCore',
  MEDIA: 'media',
  SOCIAL: 'social',
  PRODUCTION: 'production',
  COPY: 'copy',
  CONFIG: 'config',
}

export function getToneClassName(tone: AppIconTone): string {
  switch (tone) {
    case 'muted':
      return 'text-text-muted'
    case 'active':
      return 'text-action-primary'
    case 'success':
      return 'text-status-success'
    case 'warning':
      return 'text-status-warning'
    case 'error':
      return 'text-status-error'
    case 'info':
      return 'text-status-info'
    case 'default':
    default:
      return 'text-text'
  }
}

export function getStatusIconName(tone: 'error' | 'success' | 'warning' | 'info' | 'neutral'): AppIconName {
  switch (tone) {
    case 'error':
      return 'error'
    case 'success':
      return 'success'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    case 'neutral':
    default:
      return 'governance'
  }
}

export function getOverviewSourceDomainIcon(sourceDomain: string): DomainIconName {
  switch (sourceDomain) {
    case 'STRATEGY':
      return 'STRATEGY'
    case 'BRAND_CORE':
      return 'BRAND_CORE'
    case 'SOCIAL_ASSETS':
      return 'SOCIAL'
    case 'CREATIVE_PRODUCTION':
      return 'PRODUCTION'
    case 'COPY_MESSAGING':
      return 'COPY'
    case 'MEDIA_LIBRARY':
    default:
      return 'MEDIA'
  }
}
