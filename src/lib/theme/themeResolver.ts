import type { ThemeMode } from './ThemeContext'
import { PRODUCT_BRAND_DARK, PRODUCT_BRAND_LIGHT } from './productBrand'

export type ClientBrandMode = 'FULL_SHELL'
export type SurfaceStyle = 'AURORA' | 'GLASS' | 'SOLID'
export type VisualDensity = 'COMPACT' | 'BALANCED' | 'EDITORIAL'
export type BrandTone = 'LUXURY_STRATEGIC' | 'PREMIUM_EDITORIAL' | 'TECH_EXECUTIVE'

export interface ProjectBrandProfile {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  neutralBase: string
  titleFont: string
  bodyFont: string
  clientBrandMode: ClientBrandMode
  surfaceStyle: SurfaceStyle
  visualDensity: VisualDensity
  brandTone: BrandTone
}

interface Palette {
  surfaceCanvas: string
  surfaceDefault: string
  surfaceMuted: string
  surfaceSubtle: string
  actionPrimary: string
  actionPrimaryHover: string
  actionSecondary: string
  actionSecondaryHover: string
  textDefault: string
  textMuted: string
  textInverse: string
  borderDefault: string
  borderStrong: string
  statusSuccess: string
  statusWarning: string
  statusError: string
  statusInfo: string
  brandGradientStart: string
  brandGradientEnd: string
  brandGlow: string
}

function normalizeHex(value: string, fallback: string) {
  const hex = value?.trim() || fallback
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex.toUpperCase() : fallback.toUpperCase()
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase()
}

function rgbChannels(value: string) {
  const { r, g, b } = hexToRgb(value)
  return `${r} ${g} ${b}`
}

function mixColors(colorA: string, colorB: string, weightB: number) {
  const a = hexToRgb(colorA)
  const b = hexToRgb(colorB)
  const weightA = 1 - weightB
  return rgbToHex(
    a.r * weightA + b.r * weightB,
    a.g * weightA + b.g * weightB,
    a.b * weightA + b.b * weightB,
  )
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const channels = [r, g, b].map((value) => {
    const normalized = value / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function ensureContrastText(background: string, preferredDark: string, preferredLight: string) {
  return luminance(background) > 0.45 ? preferredDark : preferredLight
}

function getBasePalette(mode: ThemeMode): Palette {
  return mode === 'light' ? PRODUCT_BRAND_LIGHT : PRODUCT_BRAND_DARK
}

function deriveSurfaceScale(
  mode: ThemeMode,
  neutralBase: string,
  primaryColor: string,
  surfaceStyle: SurfaceStyle,
) {
  if (mode === 'light') {
    const canvas = mixColors('#FBF6F0', neutralBase, 0.18)
    const defaultSurface = mixColors('#FFFFFF', neutralBase, surfaceStyle === 'GLASS' ? 0.08 : 0.12)
    const muted = mixColors('#F3ECE4', neutralBase, 0.28)
    const subtle = mixColors('#FFFCF8', primaryColor, 0.04)

    return { canvas, defaultSurface, muted, subtle }
  }

  const canvas = mixColors('#070912', neutralBase, 0.18)
  const defaultSurface = mixColors('#101322', neutralBase, surfaceStyle === 'SOLID' ? 0.22 : 0.32)
  const muted = mixColors('#181C2F', neutralBase, 0.4)
  const subtle = mixColors('#0C1020', primaryColor, 0.08)

  return { canvas, defaultSurface, muted, subtle }
}

export function getDefaultProjectBrandProfile(): ProjectBrandProfile {
  return {
    primaryColor: PRODUCT_BRAND_DARK.actionPrimary,
    secondaryColor: PRODUCT_BRAND_DARK.actionSecondary,
    accentColor: '#F97316',
    neutralBase: '#1A1427',
    titleFont: 'Sora',
    bodyFont: 'Inter',
    clientBrandMode: 'FULL_SHELL',
    surfaceStyle: 'AURORA',
    visualDensity: 'BALANCED',
    brandTone: 'LUXURY_STRATEGIC',
  }
}

export function resolveProductThemeVariables(mode: ThemeMode) {
  const palette = getBasePalette(mode)

  return {
    '--surface-canvas': rgbChannels(palette.surfaceCanvas),
    '--surface-default': rgbChannels(palette.surfaceDefault),
    '--surface-muted': rgbChannels(palette.surfaceMuted),
    '--surface-subtle': rgbChannels(palette.surfaceSubtle),
    '--action-primary': rgbChannels(palette.actionPrimary),
    '--action-primary-hover': rgbChannels(palette.actionPrimaryHover),
    '--action-secondary': rgbChannels(palette.actionSecondary),
    '--action-secondary-hover': rgbChannels(palette.actionSecondaryHover),
    '--action-primary-rgb': rgbChannels(palette.actionPrimary),
    '--text-default': rgbChannels(palette.textDefault),
    '--text-muted': rgbChannels(palette.textMuted),
    '--text-inverse': rgbChannels(palette.textInverse),
    '--border-default': rgbChannels(palette.borderDefault),
    '--border-strong': rgbChannels(palette.borderStrong),
    '--status-success': rgbChannels(palette.statusSuccess),
    '--status-warning': rgbChannels(palette.statusWarning),
    '--status-error': rgbChannels(palette.statusError),
    '--status-info': rgbChannels(palette.statusInfo),
    '--brand-gradient-start': palette.brandGradientStart,
    '--brand-gradient-end': palette.brandGradientEnd,
    '--brand-glow': palette.brandGlow,
  } satisfies Record<string, string>
}

export function resolveProjectThemeVariables(profile: ProjectBrandProfile, mode: ThemeMode) {
  const fallback = getDefaultProjectBrandProfile()
  const palette = getBasePalette(mode)
  const primaryColor = normalizeHex(profile.primaryColor, fallback.primaryColor)
  const secondaryColor = normalizeHex(profile.secondaryColor, fallback.secondaryColor)
  const accentColor = normalizeHex(profile.accentColor, fallback.accentColor)
  const neutralBase = normalizeHex(profile.neutralBase, fallback.neutralBase)

  const { canvas, defaultSurface, muted, subtle } = deriveSurfaceScale(
    mode,
    neutralBase,
    primaryColor,
    profile.surfaceStyle,
  )

  const textDefault = ensureContrastText(defaultSurface, '#16131F', '#F8F3ED')
  const textMuted = mode === 'light' ? mixColors(textDefault, '#A29587', 0.46) : mixColors(textDefault, '#9D92B1', 0.44)
  const inverse = ensureContrastText(primaryColor, '#120F1D', '#FFF8F2')
  const borderDefault = mixColors(defaultSurface, primaryColor, mode === 'light' ? 0.18 : 0.22)
  const borderStrong = mixColors(defaultSurface, accentColor, mode === 'light' ? 0.34 : 0.32)
  const primaryHover = mixColors(primaryColor, mode === 'light' ? '#1A1624' : '#FFFFFF', 0.12)
  const secondaryHover = mixColors(secondaryColor, mode === 'light' ? '#2E2012' : '#FFFFFF', 0.14)
  const gradientStart = mixColors(primaryColor, palette.brandGradientStart, 0.18)
  const gradientEnd = mixColors(secondaryColor, accentColor, 0.26)

  return {
    '--surface-canvas': rgbChannels(canvas),
    '--surface-default': rgbChannels(defaultSurface),
    '--surface-muted': rgbChannels(muted),
    '--surface-subtle': rgbChannels(subtle),
    '--action-primary': rgbChannels(primaryColor),
    '--action-primary-hover': rgbChannels(primaryHover),
    '--action-secondary': rgbChannels(secondaryColor),
    '--action-secondary-hover': rgbChannels(secondaryHover),
    '--action-primary-rgb': rgbChannels(primaryColor),
    '--text-default': rgbChannels(textDefault),
    '--text-muted': rgbChannels(textMuted),
    '--text-inverse': rgbChannels(inverse),
    '--border-default': rgbChannels(borderDefault),
    '--border-strong': rgbChannels(borderStrong),
    '--brand-gradient-start': gradientStart,
    '--brand-gradient-end': gradientEnd,
    '--brand-glow': accentColor,
    '--font-display': `'${profile.titleFont}', ${mode === 'light' ? 'Sora' : 'Sora'}, sans-serif`,
    '--font-sans': `'${profile.bodyFont}', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    '--project-density': profile.visualDensity.toLowerCase(),
    '--project-surface-style': profile.surfaceStyle.toLowerCase(),
    '--project-brand-tone': profile.brandTone.toLowerCase(),
  } satisfies Record<string, string>
}
