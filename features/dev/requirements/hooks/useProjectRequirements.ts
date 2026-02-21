import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getProjectRequirements,
  upsertProjectRequirements,
} from '../lib/requirements'
import type { ProjectRequirements } from '../types/project-requirements'
import { SWR_KEYS } from '@/lib/swr-keys'

interface UseProjectRequirementsResult {
  requirements: ProjectRequirements | null
  isLoading: boolean
  error: string | null
  saveRequirements: (content: string) => Promise<void>
  refreshRequirements: () => Promise<ProjectRequirements | null>
}

export function useProjectRequirements(
  projectId: number | null,
): UseProjectRequirementsResult {
  const key =
    projectId !== null ? SWR_KEYS.devProjectRequirements(projectId) : null
  const {
    data = null,
    error,
    isLoading,
    mutate: mutateKey,
  } = useSWR<ProjectRequirements | null>(
    key,
    () =>
      projectId !== null
        ? getProjectRequirements(projectId)
        : Promise.resolve(null),
  )

  const saveRequirements = async (content: string): Promise<void> => {
    if (projectId === null) return
    await upsertProjectRequirements(projectId, content)
    await mutateKey()
    await mutate(SWR_KEYS.devProjectRequirements(projectId))
  }

  const refreshRequirements = async (): Promise<ProjectRequirements | null> => {
    if (key === null) return null
    return mutateKey()
  }

  return {
    requirements: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch project requirements'
      : null,
    saveRequirements,
    refreshRequirements,
  }
}
