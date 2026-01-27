import useSWR from 'swr'
import { mutate } from 'swr'
import {
  createVisionItem,
  getAllVisionItems,
  updateVisionItem,
  deleteVisionItem,
  reorderVisionItems,
} from '@/lib/vision'
import type {
  VisionItem,
  CreateVisionItemInput,
  UpdateVisionItemInput,
} from '@/lib/types/vision-item'
import { fetcher } from '@/lib/swr'

const visionKey = 'vision'

export function useVision() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<VisionItem[]>(visionKey, () =>
    fetcher(() => getAllVisionItems()),
  )

  const handleCreateVisionItem = async (input: CreateVisionItemInput) => {
    await createVisionItem(input)
    await mutate(visionKey)
  }

  const handleUpdateVisionItem = async (
    id: number,
    input: UpdateVisionItemInput,
  ) => {
    await updateVisionItem(id, input)
    await mutate(visionKey)
  }

  const handleDeleteVisionItem = async (id: number) => {
    await deleteVisionItem(id)
    await mutate(visionKey)
  }

  const handleReorderVisionItems = async (itemIds: number[]) => {
    await reorderVisionItems(itemIds)
    await mutate(visionKey)
  }

  return {
    items: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch vision items'
      : null,
    createVisionItem: handleCreateVisionItem,
    updateVisionItem: handleUpdateVisionItem,
    deleteVisionItem: handleDeleteVisionItem,
    reorderVisionItems: handleReorderVisionItems,
    refreshVision: () => mutate(visionKey),
  }
}
