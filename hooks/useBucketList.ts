import useSWR from 'swr'
import { mutate } from 'swr'
import {
  createBucketListItem,
  getAllBucketListItems,
  updateBucketListItem,
  deleteBucketListItem,
  deleteCompletedBucketListItems,
} from '@/lib/bucket-list'
import type {
  BucketListItem,
  CreateBucketListItemInput,
  UpdateBucketListItemInput,
} from '@/lib/types/bucket-list-item'
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
    await createBucketListItem(input)
    await mutate(bucketListKey)
  }

  const handleUpdateBucketListItem = async (
    id: number,
    input: UpdateBucketListItemInput,
  ) => {
    await updateBucketListItem(id, input)
    await mutate(bucketListKey)
  }

  const handleDeleteBucketListItem = async (id: number) => {
    await deleteBucketListItem(id)
    await mutate(bucketListKey)
  }

  const handleToggleBucketListItemCompletion = async (
    id: number,
    completed: boolean,
  ) => {
    await updateBucketListItem(id, { completed })
    await mutate(bucketListKey)
  }

  const handleDeleteCompletedBucketListItems = async () => {
    await deleteCompletedBucketListItems()
    await mutate(bucketListKey)
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
    deleteCompletedBucketListItems: handleDeleteCompletedBucketListItems,
    refreshBucketList: () => mutate(bucketListKey),
  }
}
