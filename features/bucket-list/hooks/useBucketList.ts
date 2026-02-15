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

const bucketListKey = 'bucket-list'

export function useBucketList() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<BucketListItem[]>(bucketListKey, () =>
    fetcher(() => getAllBucketListItems()),
  )

  const handleCreateBucketListItem = async (input: CreateBucketListItemInput) => {
    const result = await createBucketListItem(input)
    await mutate(bucketListKey)
    return result
  }

  const handleUpdateBucketListItem = async (
    id: number,
    input: UpdateBucketListItemInput,
  ) => {
    const result = await updateBucketListItem(id, input)
    await mutate(bucketListKey)
    return result
  }

  const handleDeleteBucketListItem = async (id: number) => {
    await deleteBucketListItem(id)
    await mutate(bucketListKey)
    return true
  }

  const handleToggleBucketListItemCompletion = async (
    id: number,
    completed: boolean,
  ) => {
    await updateBucketListItem(id, { completed })
    await mutate(bucketListKey)
  }

  const handleDeleteBucketListItemsByIds = async (ids: number[]) => {
    await deleteBucketListItemsByIds(ids)
    await mutate(bucketListKey)
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
