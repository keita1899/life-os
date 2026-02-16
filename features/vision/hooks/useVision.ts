import useSWR from 'swr'
import { mutate } from 'swr'
import {
  createVisionItem,
  getAllVisionItems,
  updateVisionItem,
  deleteVisionItem,
} from '../lib'
import type {
  VisionItem,
  CreateVisionItemInput,
  UpdateVisionItemInput,
} from '../types/vision-item'
import { fetcher } from '@/lib/swr'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useVision() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<VisionItem[]>(SWR_KEYS.vision, () =>
    fetcher(() => getAllVisionItems()),
  )

  const handleCreateVisionItem = async (input: CreateVisionItemInput) => {
    await createVisionItem(input)
    await mutate(SWR_KEYS.vision)
  }

  const handleUpdateVisionItem = async (
    id: number,
    input: UpdateVisionItemInput,
  ) => {
    await updateVisionItem(id, input)
    await mutate(SWR_KEYS.vision)
  }

  const handleDeleteVisionItem = async (id: number) => {
    await deleteVisionItem(id)
    await mutate(SWR_KEYS.vision)
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
  }
}
