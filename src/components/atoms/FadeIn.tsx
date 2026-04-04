import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

export interface FadeInProps extends HTMLMotionProps<'div'> {
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  children: ReactNode
}

/**
 * FadeIn
 * Orchestrated orchestrated entry animation for premium page/section loading.
 * Uses spring physics for a natural, high-performance entrance.
 */
export const FadeIn = ({
  delay = 0,
  direction = 'none',
  children,
  className = '',
  ...props
}: FadeInProps) => {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: { x: 0, y: 0 },
  }

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directions[direction] 
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      transition={{
        duration: 0.5,
        delay,
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default FadeIn
