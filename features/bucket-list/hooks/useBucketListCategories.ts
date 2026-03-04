import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllBucketListCategories,
  createBucketListCategory,
  updateBucketListCategory,
  deleteBucketListCategory,
  reorderBucketListCategories,
} from '../lib'
import type {
  BucketListCategory,
  CreateBucketListCategoryInput,
  UpdateBucketListCategoryInput,
} from '../types/bucket-list-category'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useBucketListCategories() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<BucketListCategory[]>(SWR_KEYS.bucketListCategories, () =>
    getAllBucketListCategories(),
  )

  const handleCreateBucketListCategory = async (
    input: CreateBucketListCategoryInput,
  ): Promise<BucketListCategory> => {
    const newCategory = await createBucketListCategory(input)
    await mutate(SWR_KEYS.bucketListCategories)
    return newCategory
  }

  const handleUpdateBucketListCategory = async (
    id: number,
    input: UpdateBucketListCategoryInput,
  ): Promise<true> => {
    await updateBucketListCategory(id, input)
    await Promise.all([
      mutate(SWR_KEYS.bucketListCategories),
      mutate(SWR_KEYS.bucketList),
    ])
    return true
  }

  const handleDeleteBucketListCategory = async (id: number): Promise<true> => {
    await deleteBucketListCategory(id)
    await Promise.all([
      mutate(SWR_KEYS.bucketListCategories),
      mutate(SWR_KEYS.bucketList),
    ])
    return true
  }

  const handleReorderCategories = async (
    updates: { id: number; sortOrder: number }[],
  ): Promise<void> => {
    await reorderBucketListCategories(updates)
    await mutate(SWR_KEYS.bucketListCategories)
  }

  return {
    categories: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch bucket list categories'
      : null,
    createBucketListCategory: handleCreateBucketListCategory,
    updateBucketListCategory: handleUpdateBucketListCategory,
    deleteBucketListCategory: handleDeleteBucketListCategory,
    reorderCategories: handleReorderCategories,
  }
}
