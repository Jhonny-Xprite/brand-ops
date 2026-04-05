import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import type { ProjectBusinessModel } from '@/lib/projectDomain'
import {
  fetchProjects,
  createProject,
  setSyncStatus,
  type Project,
} from '@/store/projects/projects.slice'

type ProjectsSyncStatus = 'synced' | 'syncing' | 'failed'
type FetchProjectsFn = () => Promise<void>

/**
 * Hook para gerenciar projetos via Redux
 */
export const useProjects = () => {
  const dispatch = useAppDispatch()
  const { items, loading, error, syncStatus, syncError } = useAppSelector(
    (state) => state.projects
  )

  const fetchProjectsList = useCallback<FetchProjectsFn>(async () => {
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
    async ({
      projectName,
      niche,
      businessModel,
      logoFile,
    }: {
      projectName: string
      niche: string
      businessModel: ProjectBusinessModel
      logoFile?: File | null
    }): Promise<Project> => {
      const result = await dispatch(createProject({ projectName, niche, businessModel, logoFile }))

      if (createProject.fulfilled.match(result)) {
        return result.payload
      }

      throw new Error((result.payload as string) || 'Failed to create project')
    },
    [dispatch]
  )

  const handleSetSyncStatus = useCallback(
    (status: ProjectsSyncStatus, errorMessage?: string) => {
      dispatch(setSyncStatus({ status, error: errorMessage }))
    },
    [dispatch]
  )

  const retry = useCallback<FetchProjectsFn>(async () => {
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

export type UseProjectsReturn = ReturnType<typeof useProjects>
