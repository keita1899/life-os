import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllDevProjects,
  createDevProject,
  updateDevProject,
  deleteDevProject,
} from '../lib'
import type {
  DevProject,
  CreateDevProjectInput,
  UpdateDevProjectInput,
} from '../types/dev-project'
import { fetcher } from '@/lib/swr'
import { SWR_KEYS } from '@/lib/swr-keys'

interface UseDevProjectsResult {
  projects: DevProject[]
  isLoading: boolean
  error: string | null
  createProject: (input: CreateDevProjectInput) => Promise<void>
  updateProject: (id: number, input: UpdateDevProjectInput) => Promise<void>
  deleteProject: (id: number) => Promise<void>
  refreshProjects: () => Promise<DevProject[] | undefined>
}

export function useDevProjects(): UseDevProjectsResult {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<DevProject[]>(SWR_KEYS.devProjects, () =>
    fetcher(() => getAllDevProjects()),
  )

  const handleCreateProject = async (
    input: CreateDevProjectInput,
  ): Promise<void> => {
    await createDevProject(input)
    await mutate(SWR_KEYS.devProjects)
  }

  const handleUpdateProject = async (
    id: number,
    input: UpdateDevProjectInput,
  ): Promise<void> => {
    await updateDevProject(id, input)
    await mutate(SWR_KEYS.devProjects)
  }

  const handleDeleteProject = async (id: number): Promise<void> => {
    await deleteDevProject(id)
    await mutate(SWR_KEYS.devProjects)
  }

  const refreshProjects = async (): Promise<DevProject[] | undefined> => {
    return await mutate(SWR_KEYS.devProjects)
  }

  return {
    projects: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch dev projects'
      : null,
    createProject: handleCreateProject,
    updateProject: handleUpdateProject,
    deleteProject: handleDeleteProject,
    refreshProjects,
  }
}
