import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllBucketListCategories,
  createBucketListCategory,
  updateBucketListCategory,
  deleteBucketListCategory,
} from '@/lib/bucket-list'
import type {
  BucketListCategory,
  CreateBucketListCategoryInput,
  UpdateBucketListCategoryInput,
} from '@/lib/types/bucket-list-category'
import { fetcher } from '@/lib/swr'

const bucketListCategoriesKey = 'bucket-list-categories'

export function useBucketListCategories() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<BucketListCategory[]>(bucketListCategoriesKey, () =>
    fetcher(() => getAllBucketListCategories()),
  )

  const handleCreateBucketListCategory = async (
    input: CreateBucketListCategoryInput,
  ): Promise<BucketListCategory> => {
    const newCategory = await createBucketListCategory(input)
    await mutate(bucketListCategoriesKey)
    return newCategory
  }

  const handleUpdateBucketListCategory = async (
    id: number,
    input: UpdateBucketListCategoryInput,
  ) => {
    await updateBucketListCategory(id, input)
    await Promise.all([
      mutate(bucketListCategoriesKey),
      mutate('bucket-list'),
    ])
  }

  const handleDeleteBucketListCategory = async (id: number) => {
    await deleteBucketListCategory(id)
    await Promise.all([
      mutate(bucketListCategoriesKey),
      mutate('bucket-list'),
    ])
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
    refreshCategories: () => mutate(bucketListCategoriesKey),
  }
}
