import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  fetchProjects,
  createProject,
  setSyncStatus,
  type Project,
} from '@/store/projects/projects.slice'

export interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: string | null
  syncStatus: 'synced' | 'syncing' | 'failed'
  syncError: string | null
  fetchProjects: () => Promise<void>
  createProject: (name: string, logoFile: File) => Promise<Project | void>
  setSyncStatus: (status: 'synced' | 'syncing' | 'failed', error?: string) => void
  retry: () => Promise<void>
}

/**
 * Hook para gerenciar projetos via Redux
 */
export const useProjects = (): UseProjectsReturn => {
  const dispatch = useAppDispatch()
  const { items, loading, error, syncStatus, syncError } = useAppSelector(
    (state) => state.projects
  )

  const fetchProjectsList = useCallback(async () => {
    try {
      dispatch(setSyncStatus({ status: 'syncing' }))
      const result = await dispatch(fetchProjects())
      if (fetchProjects.fulfilled.match(result)) {
        dispatch(setSyncStatus({ status: 'synced' }))
      } else {
        dispatch(
          setSyncStatus({ status: 'failed', error: result.payload as string })
        )
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      dispatch(setSyncStatus({ status: 'failed', error: message }))
    }
  }, [dispatch])

  const createNewProject = useCallback(
    async (name: string, logoFile: File) => {
      try {
        const result = await dispatch(createProject({ projectName: name, logoFile }))
        if (createProject.fulfilled.match(result)) {
          return result.payload
        } else {
          throw new Error(result.payload as string)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create project'
        throw new Error(message)
      }
    },
    [dispatch]
  )

  const handleSetSyncStatus = useCallback(
    (status: 'synced' | 'syncing' | 'failed', error?: string) => {
      dispatch(setSyncStatus({ status, error }))
    },
    [dispatch]
  )

  const retry = useCallback(async () => {
    await fetchProjectsList()
  }, [fetchProjectsList])

  return {
    projects: items,
    loading,
    error,
    syncStatus,
    syncError,
    fetchProjects: fetchProjectsList,
    createProject: createNewProject,
    setSyncStatus: handleSetSyncStatus,
    retry,
  }
}
