import useSWR from 'swr'
import { mutate } from 'swr'
import {
  createBucketListItem,
  getAllBucketListItems,
  updateBucketListItem,
  deleteBucketListItem,
  deleteBucketListItemsByIds,
} from '../lib'
import type {
  BucketListItem,
  CreateBucketListItemInput,
  UpdateBucketListItemInput,
} from '../types/bucket-list-item'
import { fetcher } from '@/lib/swr'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useBucketList() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<BucketListItem[]>(SWR_KEYS.bucketList, () =>
    fetcher(() => getAllBucketListItems()),
  )

  const handleCreateBucketListItem = async (input: CreateBucketListItemInput) => {
    const result = await createBucketListItem(input)
    await mutate(SWR_KEYS.bucketList)
    return result
  }

  const handleUpdateBucketListItem = async (
    id: number,
    input: UpdateBucketListItemInput,
  ) => {
    const result = await updateBucketListItem(id, input)
    await mutate(SWR_KEYS.bucketList)
    return result
  }

  const handleDeleteBucketListItem = async (id: number) => {
    await deleteBucketListItem(id)
    await mutate(SWR_KEYS.bucketList)
    return true
  }

  const handleToggleBucketListItemCompletion = async (
    id: number,
    completed: boolean,
  ) => {
    await updateBucketListItem(id, { completed })
    await mutate(SWR_KEYS.bucketList)
  }

  const handleDeleteBucketListItemsByIds = async (ids: number[]) => {
    await deleteBucketListItemsByIds(ids)
    await mutate(SWR_KEYS.bucketList)
    return true
  }

  return {
    items: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch bucket list items'
      : null,
    createBucketListItem: handleCreateBucketListItem,
    updateBucketListItem: handleUpdateBucketListItem,
    deleteBucketListItem: handleDeleteBucketListItem,
    toggleBucketListItemCompletion: handleToggleBucketListItemCompletion,
    deleteBucketListItemsByIds: handleDeleteBucketListItemsByIds,
  }
}
