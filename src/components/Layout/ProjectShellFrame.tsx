import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'

import { useTheme } from '@/lib/theme/ThemeContext'
import {
  getDefaultProjectBrandProfile,
  resolveProjectThemeVariables,
  type ProjectBrandProfile,
} from '@/lib/theme/themeResolver'
import { useAppDispatch, useAppSelector } from '@/store'
import { setActiveProjectId } from '@/store/projects/projects.slice'

import ProjectNavbar from './ProjectNavbar'

interface ProjectShellFrameProps {
  children: ReactNode
  projectId: string
  projectName?: string
  workspaceClassName?: string
}

interface ProjectBrandResponse extends ProjectBrandProfile {
  projectId: string
  projectName: string
}

type BrandThemeStyle = CSSProperties & Record<`--${string}`, string>

export function ProjectShellFrame({
  children,
  projectId,
  projectName,
  workspaceClassName = 'desktop-workspace min-w-0 px-8 py-8',
}: ProjectShellFrameProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const projects = useAppSelector((state) => state.projects.items)
  const { theme } = useTheme()
  const [brandProfile, setBrandProfile] = useState<ProjectBrandProfile>(getDefaultProjectBrandProfile())

  useEffect(() => {
    if (projectId) {
      dispatch(setActiveProjectId(projectId))
    }
  }, [projectId, dispatch])

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const projectExists = projects.some((project) => project.id === projectId)
      if (!projectExists) {
        void router.push('/')
      }
    }
  }, [projectId, projects, router])

  useEffect(() => {
    let ignore = false

    const fetchBrandProfile = async () => {
      try {
        const response = await fetch(`/api/projeto/${projectId}/brand-core`)
        if (!response.ok) {
          return
        }

        const data = (await response.json()) as ProjectBrandResponse
        if (!ignore) {
          setBrandProfile({
            primaryColor: data.primaryColor,
            secondaryColor: data.secondaryColor,
            accentColor: data.accentColor,
            neutralBase: data.neutralBase,
            titleFont: data.titleFont,
            bodyFont: data.bodyFont,
            clientBrandMode: data.clientBrandMode,
            surfaceStyle: data.surfaceStyle,
            visualDensity: data.visualDensity,
            brandTone: data.brandTone,
          })
        }
      } catch {
        if (!ignore) {
          setBrandProfile(getDefaultProjectBrandProfile())
        }
      }
    }

    void fetchBrandProfile()

    return () => {
      ignore = true
    }
  }, [projectId])

  const displayName = projectName || projects.find((project) => project.id === projectId)?.name || 'Projeto'

  const brandThemeStyle = useMemo<BrandThemeStyle>(() => {
    return resolveProjectThemeVariables(brandProfile, theme) as BrandThemeStyle
  }, [brandProfile, theme])

  return (
    <div className="project-brand-shell desktop-app-shell min-h-screen bg-canvas text-text" style={brandThemeStyle}>
      <ProjectNavbar projectId={projectId} projectName={displayName} />
      <main className={workspaceClassName}>
        {children}
      </main>
    </div>
  )
}

export default ProjectShellFrame
