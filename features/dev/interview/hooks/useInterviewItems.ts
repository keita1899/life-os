import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllInterviewItems,
  createInterviewItem,
  updateInterviewItem,
  deleteInterviewItem,
} from '../lib'
import type {
  InterviewItem,
  CreateInterviewItemInput,
  UpdateInterviewItemInput,
} from '../types/interview-item'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useInterviewItems() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<InterviewItem[]>(SWR_KEYS.interviewItems, () =>
    getAllInterviewItems(),
  )

  const handleCreate = async (input: CreateInterviewItemInput): Promise<true> => {
    await createInterviewItem(input)
    await mutate(SWR_KEYS.interviewItems)
    return true
  }

  const handleUpdate = async (
    id: number,
    input: UpdateInterviewItemInput,
  ): Promise<true> => {
    await updateInterviewItem(id, input)
    await mutate(SWR_KEYS.interviewItems)
    return true
  }

  const handleDelete = async (id: number): Promise<true> => {
    await deleteInterviewItem(id)
    await mutate(SWR_KEYS.interviewItems)
    return true
  }

  return {
    items: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch interview items'
      : null,
    createItem: handleCreate,
    updateItem: handleUpdate,
    deleteItem: handleDelete,
  }
}
