import { useCallback } from 'react'
import useSWR from 'swr'
import {
  getProjectDbDesign,
  upsertProjectDbDesign,
} from '../lib/db-designs'
import type { ProjectDbDesign } from '../types/project-db-design'
import { SWR_KEYS } from '@/lib/swr-keys'

interface UseProjectDbDesignResult {
  dbDesign: ProjectDbDesign | null
  isLoading: boolean
  error: string | null
  upsertDbDesign: (content: string) => Promise<void>
  refreshDbDesign: () => Promise<ProjectDbDesign | null | undefined>
}

export function useProjectDbDesign(
  projectId: number | null,
): UseProjectDbDesignResult {
  const key =
    projectId !== null ? SWR_KEYS.devProjectDbDesign(projectId) : null
  const {
    data = null,
    error,
    isLoading,
    mutate: mutateKey,
  } = useSWR<ProjectDbDesign | null>(
    key,
    () =>
      projectId !== null
        ? getProjectDbDesign(projectId)
        : Promise.resolve(null),
  )

  const upsertDbDesign = useCallback(
    async (content: string): Promise<void> => {
      if (projectId === null) return
      await upsertProjectDbDesign(projectId, content)
      await mutateKey()
    },
    [projectId, mutateKey],
  )

  const refreshDbDesign = useCallback(async (): Promise<
    ProjectDbDesign | null | undefined
  > => {
    if (key === null) return undefined
    return mutateKey()
  }, [key, mutateKey])

  return {
    dbDesign: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch project db design'
      : null,
    upsertDbDesign,
    refreshDbDesign,
  }
}
