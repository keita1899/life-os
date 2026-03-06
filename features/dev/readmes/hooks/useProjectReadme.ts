import { useCallback } from 'react'
import useSWR from 'swr'
import {
  getProjectReadme,
  upsertProjectReadme,
} from '../lib/readme'
import type { ProjectReadme } from '../types/project-readme'
import { SWR_KEYS } from '@/lib/swr-keys'

interface UseProjectReadmeResult {
  readme: ProjectReadme | null
  isLoading: boolean
  error: string | null
  upsertReadme: (content: string) => Promise<void>
  refreshReadme: () => Promise<ProjectReadme | null | undefined>
}

export function useProjectReadme(
  projectId: number | null,
): UseProjectReadmeResult {
  const key =
    projectId !== null ? SWR_KEYS.devProjectReadme(projectId) : null
  const {
    data = null,
    error,
    isLoading,
    mutate: mutateKey,
  } = useSWR<ProjectReadme | null>(
    key,
    () =>
      projectId !== null
        ? getProjectReadme(projectId)
        : Promise.resolve(null),
  )

  const upsertReadme = useCallback(
    async (content: string): Promise<void> => {
      if (projectId === null) return
      await upsertProjectReadme(projectId, content)
      await mutateKey()
    },
    [projectId, mutateKey],
  )

  const refreshReadme = useCallback(async (): Promise<
    ProjectReadme | null | undefined
  > => {
    if (key === null) return undefined
    return mutateKey()
  }, [key, mutateKey])

  return {
    readme: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch project readme'
      : null,
    upsertReadme,
    refreshReadme,
  }
}
