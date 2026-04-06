import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

export interface MotionButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
}

/**
 * MotionButton
 * Premium interactive button with physics-based feedback.
 * Standardizes click and hover scale effects.
 */
export const MotionButton = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}: MotionButtonProps) => {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  }[variant]

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ 
        type: 'spring', 
        stiffness: 500, 
        damping: 15,
        mass: 0.5
      }}
      className={`${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default MotionButton
