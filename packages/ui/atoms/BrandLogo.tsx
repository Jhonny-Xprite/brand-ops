import React from 'react'
import { motion } from 'framer-motion'

import { PRODUCT_BRAND_NAME, PRODUCT_BRAND_WORDMARK } from '@/lib/theme/productBrand'

interface BrandLogoProps {
  size?: number | string
  className?: string
  variant?: 'solid' | 'outline' | 'glass'
}

interface BrandSignatureProps {
  size?: number | string
  className?: string
  compact?: boolean
  align?: 'left' | 'center'
}

function getVariantClasses(variant: BrandLogoProps['variant']) {
  switch (variant) {
    case 'outline':
      return {
        shell: 'fill-transparent',
        stroke: 'stroke-action-primary/80',
        accent: 'fill-action-primary',
        light: 'fill-action-secondary',
        text: 'stroke-text',
      }
    case 'glass':
      return {
        shell: 'fill-white/10',
        stroke: 'stroke-white/20',
        accent: 'fill-action-primary',
        light: 'fill-action-secondary',
        text: 'stroke-white',
      }
    case 'solid':
    default:
      return {
        shell: 'fill-[url(#bo-shell-gradient)]',
        stroke: 'stroke-white/10',
        accent: 'fill-action-primary',
        light: 'fill-action-secondary',
        text: 'stroke-white',
      }
  }
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 40,
  className = '',
  variant = 'solid',
}) => {
  const styles = getVariantClasses(variant)

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block drop-shadow-[0_18px_36px_rgba(8,11,20,0.25)] ${className}`}
      whileHover={{ scale: 1.04, rotate: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bo-shell-gradient" x1="16" y1="12" x2="78" y2="86" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgb(var(--action-primary))" />
          <stop offset="0.6" stopColor="rgb(var(--action-primary-hover))" />
          <stop offset="1" stopColor="rgb(var(--action-secondary))" />
        </linearGradient>
      </defs>

      <rect x="8" y="8" width="80" height="80" rx="24" className={`${styles.shell} ${styles.stroke}`} strokeWidth="2.5" />
      <circle cx="74" cy="22" r="7" className={styles.light} opacity="0.95" />
      <circle cx="74" cy="22" r="3" className="fill-white" opacity="0.95" />

      <path
        d="M26 25H47C58.0457 25 67 33.9543 67 45C67 56.0457 58.0457 65 47 65H26V25Z"
        className={`${styles.text}`}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M45 33H56C62.6274 33 68 38.3726 68 45C68 51.6274 62.6274 57 56 57H45"
        className={`${styles.text}`}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M46 45H62"
        className={`${styles.text}`}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <rect x="22" y="25" width="8" height="40" rx="4" className="fill-white/94" />
      <path
        d="M56 34C62.0751 34 67 38.9249 67 45C67 51.0751 62.0751 56 56 56"
        className={styles.accent}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </motion.svg>
  )
}

export const BrandSignature: React.FC<BrandSignatureProps> = ({
  size = 44,
  className = '',
  compact = false,
  align = 'left',
}) => {
  return (
    <div className={`flex items-center gap-4 ${align === 'center' ? 'justify-center text-center' : ''} ${className}`}>
      <BrandLogo size={size} variant="solid" />
      <div className={align === 'center' ? 'items-center' : ''}>
        <div className="brand-wordmark text-[clamp(1.25rem,2vw,1.95rem)] font-display font-bold tracking-tight text-text">
          {PRODUCT_BRAND_NAME}
        </div>
        {!compact ? (
          <>
            <p className="eyebrow-label mt-1 text-action-secondary/85">{PRODUCT_BRAND_WORDMARK.eyebrow}</p>
            <p className="mt-2 text-sm text-text-muted">{PRODUCT_BRAND_WORDMARK.tagLine}</p>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default BrandLogo
