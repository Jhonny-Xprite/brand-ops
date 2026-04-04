import React from 'react'
import { motion } from 'framer-motion'

interface BrandLogoProps {
  size?: number | string
  className?: string
  variant?: 'solid' | 'outline' | 'glass'
}

/**
 * BrandLogo Atom (BO Monogram)
 * The definitive visual mark for Brand Ops. 
 * Represents "Strategic Command" and "Operational Intelligence".
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 40, 
  className = '', 
  variant = 'solid' 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return {
          bg: 'fill-transparent',
          stroke: 'stroke-action-primary',
          text: 'fill-action-primary'
        }
      case 'glass':
        return {
          bg: 'fill-white/10 backdrop-blur-md',
          stroke: 'stroke-white/20',
          text: 'fill-white'
        }
      default: // solid
        return {
          bg: 'fill-action-primary',
          stroke: 'stroke-transparent',
          text: 'fill-white'
        }
    }
  }

  const { bg, stroke, text } = getVariantStyles()

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
    >
      {/* Decorative Shield / Shield Core */}
      <rect 
        x="10" 
        y="10" 
        width="80" 
        height="80" 
        rx="24" 
        className={`${bg} ${stroke}`}
        strokeWidth="4"
      />
      
      {/* Monogram "B" */}
      <text
        x="32"
        y="68"
        className={`${text} font-display font-bold`}
        style={{ fontSize: '48px', letterSpacing: '-0.05em' }}
      >
        B
      </text>

      {/* Monogram "O" */}
      <text
        x="68"
        y="68"
        className={`${text} font-display font-bold`}
        style={{ fontSize: '48px', letterSpacing: '-0.05em', textAnchor: 'middle' }}
      >
        O
      </text>

      {/* Sub-Mark indicator (Command Dot) */}
      <circle cx="82" cy="18" r="6" className="fill-white" />
      <circle cx="82" cy="18" r="3" className="fill-action-primary" />
    </motion.svg>
  )
}

export default BrandLogo
