import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getDevMemosByProjectId,
  createDevMemo,
  updateDevMemo,
  deleteDevMemo,
} from '../lib'
import type {
  DevMemo,
  CreateDevMemoInput,
  UpdateDevMemoInput,
} from '../types/dev-memo'
import { SWR_KEYS } from '@/lib/swr-keys'

interface UseDevMemosByProjectIdResult {
  memos: DevMemo[]
  isLoading: boolean
  error: string | null
  createMemo: (input: CreateDevMemoInput) => Promise<void>
  updateMemo: (id: number, input: UpdateDevMemoInput) => Promise<void>
  deleteMemo: (id: number) => Promise<void>
  refreshMemos: () => Promise<DevMemo[] | undefined>
}

export function useDevMemosByProjectId(
  projectId: number | null,
): UseDevMemosByProjectIdResult {
  const key =
    projectId !== null ? SWR_KEYS.devMemosByProject(projectId) : null
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<DevMemo[]>(key, () =>
    projectId !== null ? getDevMemosByProjectId(projectId) : Promise.resolve([]),
  )

  const invalidate = async (): Promise<DevMemo[] | undefined> => {
    await mutate(SWR_KEYS.devMemos)
    if (projectId !== null) {
      await mutate(SWR_KEYS.devMemosByProject(projectId))
    }
    return undefined
  }

  const handleCreateMemo = async (
    input: CreateDevMemoInput,
  ): Promise<void> => {
    await createDevMemo({ ...input, projectId: input.projectId ?? projectId })
    await invalidate()
  }

  const handleUpdateMemo = async (
    id: number,
    input: UpdateDevMemoInput,
  ): Promise<void> => {
    await updateDevMemo(id, input)
    await mutate(SWR_KEYS.devMemo(id))
    await invalidate()
  }

  const handleDeleteMemo = async (id: number): Promise<void> => {
    await deleteDevMemo(id)
    await invalidate()
  }

  const refreshMemos = async (): Promise<DevMemo[] | undefined> => {
    return invalidate()
  }

  return {
    memos: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch dev memos'
      : null,
    createMemo: handleCreateMemo,
    updateMemo: handleUpdateMemo,
    deleteMemo: handleDeleteMemo,
    refreshMemos,
  }
}
