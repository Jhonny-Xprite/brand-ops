import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

interface BrandHealthProps {
  score: number // 0 to 100
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showPulse?: boolean
}

/**
 * BrandHealth Atom (Gamification)
 * A minimalist indicator of strategic completeness (BHI).
 * Reflects the "Soul" of the brand: Precision & Clarity.
 */
export const BrandHealth: React.FC<BrandHealthProps> = ({
  score,
  label = 'Brand Health',
  size = 'md',
  showPulse = true,
}) => {
  const normalizedScore = Math.min(100, Math.max(0, score))
  const circumference = 2 * Math.PI * 18
  const offset = circumference - (normalizedScore / 100) * circumference

  const sizes = {
    sm: { circle: 'h-8 w-8', text: 'text-[10px]', stroke: 3 },
    md: { circle: 'h-12 w-12', text: 'text-xs', stroke: 4 },
    lg: { circle: 'h-20 w-20', text: 'text-base', stroke: 6 },
  }

  const { circle, text, stroke } = sizes[size]

  // Color logic based on BHI (strategy.md)
  const getStatusColor = () => {
    if (score < 30) return 'text-status-warning'
    if (score < 70) return 'text-action-primary/60'
    return 'text-action-primary'
  }

  return (
    <div className="group relative inline-flex flex-col items-center gap-2">
      <div className={`${circle} relative`}>
        {/* Background Track */}
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="transparent"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-border/20"
          />
          {/* Progress Path */}
          <motion.circle
            cx="20"
            cy="20"
            r="18"
            fill="transparent"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            className={getStatusColor()}
            strokeLinecap="round"
          />
        </svg>

        {/* Pulsing Aura (Gamification Effect) */}
        <AnimatePresence>
          {showPulse && score >= 70 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.4, 0], scale: [1, 1.3, 1.5] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-action-primary/20 -z-10"
            />
          )}
        </AnimatePresence>

        {/* Score Value */}
        <div className="absolute inset-0 flex items-center justify-center font-display font-bold">
          <span className={text}>{normalizedScore}%</span>
        </div>
      </div>
      
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted/60 opacity-0 group-hover:opacity-100 transition-opacity">
          {label}
        </span>
      )}
    </div>
  )
}

export default BrandHealth
