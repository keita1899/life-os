import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getDevMemos,
  createDevMemo,
  updateDevMemo,
  deleteDevMemo,
} from '../lib'
import type { GetDevMemosOptions } from '../lib/memo'
import type {
  DevMemo,
  CreateDevMemoInput,
  UpdateDevMemoInput,
} from '../types/dev-memo'
import { SWR_KEYS } from '@/lib/swr-keys'

interface UseDevMemosResult {
  memos: DevMemo[]
  isLoading: boolean
  error: string | null
  createMemo: (input: CreateDevMemoInput) => Promise<void>
  updateMemo: (id: number, input: UpdateDevMemoInput) => Promise<void>
  deleteMemo: (id: number) => Promise<void>
  refreshMemos: () => Promise<DevMemo[] | undefined>
}

export function useDevMemos(options?: GetDevMemosOptions): UseDevMemosResult {
  const keyword = options?.keyword?.trim()
  const orderBy = options?.orderBy ?? 'newest'
  const baseKey = keyword
    ? SWR_KEYS.devMemosWithKeyword(keyword)
    : SWR_KEYS.devMemos
  const swrKey =
    orderBy === 'oldest'
      ? SWR_KEYS.devMemosWithOrder(baseKey, 'oldest')
      : baseKey
  const otherSortKey =
    orderBy === 'oldest' ? baseKey : SWR_KEYS.devMemosWithOrder(baseKey, 'oldest')
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<DevMemo[]>(swrKey, () => getDevMemos(options))

  const mutateAllMemos = async (): Promise<void> => {
    await mutate(SWR_KEYS.devMemos)
    await mutate(swrKey)
    await mutate(otherSortKey)
  }

  const handleCreateMemo = async (
    input: CreateDevMemoInput,
  ): Promise<void> => {
    await createDevMemo(input)
    await mutateAllMemos()
  }

  const handleUpdateMemo = async (
    id: number,
    input: UpdateDevMemoInput,
  ): Promise<void> => {
    await updateDevMemo(id, input)
    await mutateAllMemos()
    await mutate(SWR_KEYS.devMemo(id))
  }

  const handleDeleteMemo = async (id: number): Promise<void> => {
    await deleteDevMemo(id)
    await mutateAllMemos()
  }

  const refreshMemos = async (): Promise<DevMemo[] | undefined> => {
    await mutateAllMemos()
    return mutate(SWR_KEYS.devMemos)
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
