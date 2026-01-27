import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllVisionCategories,
  createVisionCategory,
  updateVisionCategory,
  deleteVisionCategory,
} from '@/lib/vision'
import type {
  VisionCategory,
  CreateVisionCategoryInput,
  UpdateVisionCategoryInput,
} from '@/lib/types/vision-category'
import { fetcher } from '@/lib/swr'

const visionCategoriesKey = 'vision-categories'
const visionKey = 'vision'

export function useVisionCategories() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<VisionCategory[]>(visionCategoriesKey, () =>
    fetcher(() => getAllVisionCategories()),
  )

  const handleCreateVisionCategory = async (
    input: CreateVisionCategoryInput,
  ): Promise<VisionCategory> => {
    const newCategory = await createVisionCategory(input)
    await mutate(visionCategoriesKey)
    return newCategory
  }

  const handleUpdateVisionCategory = async (
    id: number,
    input: UpdateVisionCategoryInput,
  ) => {
    await updateVisionCategory(id, input)
    await mutate(visionCategoriesKey)
  }

  const handleDeleteVisionCategory = async (id: number) => {
    await deleteVisionCategory(id)
    await mutate(visionCategoriesKey)
    await mutate(visionKey)
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
    refreshCategories: () => mutate(visionCategoriesKey),
  }
}
