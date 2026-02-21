import { useCallback } from 'react'
import useSWR from 'swr'
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
  upsertRequirements: (content: string) => Promise<void>
  refreshRequirements: () => Promise<ProjectRequirements | null | undefined>
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

  const upsertRequirements = useCallback(
    async (content: string): Promise<void> => {
      if (projectId === null) return
      await upsertProjectRequirements(projectId, content)
      await mutateKey()
    },
    [projectId, mutateKey],
  )

  const refreshRequirements = useCallback(async (): Promise<
    ProjectRequirements | null | undefined
  > => {
    if (key === null) return undefined
    return mutateKey()
  }, [key, mutateKey])

  return {
    requirements: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch project requirements'
      : null,
    upsertRequirements,
    refreshRequirements,
  }
}
