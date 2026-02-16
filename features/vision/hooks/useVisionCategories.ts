import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllVisionCategories,
  createVisionCategory,
  updateVisionCategory,
  deleteVisionCategory,
} from '../lib'
import type {
  VisionCategory,
  CreateVisionCategoryInput,
  UpdateVisionCategoryInput,
} from '../types/vision-category'
import { fetcher } from '@/lib/swr'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useVisionCategories() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<VisionCategory[]>(SWR_KEYS.visionCategories, () =>
    fetcher(() => getAllVisionCategories()),
  )

  const handleCreateVisionCategory = async (
    input: CreateVisionCategoryInput,
  ): Promise<VisionCategory> => {
    const newCategory = await createVisionCategory(input)
    await mutate(SWR_KEYS.visionCategories)
    return newCategory
  }

  const handleUpdateVisionCategory = async (
    id: number,
    input: UpdateVisionCategoryInput,
  ): Promise<true> => {
    await updateVisionCategory(id, input)
    await mutate(SWR_KEYS.visionCategories)
    return true
  }

  const handleDeleteVisionCategory = async (id: number): Promise<true> => {
    await deleteVisionCategory(id)
    await mutate(SWR_KEYS.visionCategories)
    await mutate(SWR_KEYS.vision)
    return true
  }

  return {
    categories: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch vision categories'
      : null,
    createVisionCategory: handleCreateVisionCategory,
    updateVisionCategory: handleUpdateVisionCategory,
    deleteVisionCategory: handleDeleteVisionCategory,
  }
}
