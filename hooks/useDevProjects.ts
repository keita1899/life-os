import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllDevProjects,
  createDevProject,
  updateDevProject,
  deleteDevProject,
} from '@/lib/dev/projects'
import type {
  DevProject,
  CreateDevProjectInput,
  UpdateDevProjectInput,
} from '@/lib/types/dev-project'
import { fetcher } from '@/lib/swr'

const devProjectsKey = 'dev-projects'

export function useDevProjects() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<DevProject[]>(devProjectsKey, () =>
    fetcher(() => getAllDevProjects()),
  )

  const handleCreateProject = async (input: CreateDevProjectInput) => {
    await createDevProject(input)
    await mutate(devProjectsKey)
  }

  const handleUpdateProject = async (
    id: number,
    input: UpdateDevProjectInput,
  ) => {
    await updateDevProject(id, input)
    await mutate(devProjectsKey)
  }

  const handleDeleteProject = async (id: number) => {
    await deleteDevProject(id)
    await mutate(devProjectsKey)
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
    refreshProjects: () => mutate(devProjectsKey),
  }
}
