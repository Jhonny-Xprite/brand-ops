import type { ReactNode } from 'react'

export interface SkipToContentProps {
  contentId: string
  children: ReactNode
}

/**
 * SkipToContent
 * Accessibility component for keyboard users to skip a long navigation bar
 * and go directly to the main content.
 */
export const SkipToContent = ({
  contentId,
  children,
}: SkipToContentProps) => {
  return (
    <a
      href={`#${contentId}`}
      className="skip-link"
    >
      {children}
    </a>
  )
}

export default SkipToContent
