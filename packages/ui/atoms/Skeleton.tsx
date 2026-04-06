import type { HTMLAttributes } from 'react'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

/**
 * Skeleton
 * Placeholder component for loading states.
 * Provides a pulse animation to indicate content is being loaded.
 */
export const Skeleton = ({ className = '', ...props }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-muted ${className}`.trim()}
      {...props}
    />
  )
}

export default Skeleton
