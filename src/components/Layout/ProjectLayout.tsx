import type { ReactNode } from 'react'

import ProjectShellFrame from './ProjectShellFrame'

export interface ProjectLayoutProps {
  children: ReactNode
  projectId: string
  projectName?: string
}

/**
 * ProjectLayout Component
 * Wraps project pages with project-aware themed shell and navigation.
 */
export const ProjectLayout = ({ children, projectId, projectName }: ProjectLayoutProps) => {
  return (
    <ProjectShellFrame projectId={projectId} projectName={projectName}>
      {children}
    </ProjectShellFrame>
  )
}

export default ProjectLayout
