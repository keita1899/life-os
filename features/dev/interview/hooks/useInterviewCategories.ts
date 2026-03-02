import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllInterviewCategories,
  createInterviewCategory,
  updateInterviewCategory,
  deleteInterviewCategory,
} from '../lib'
import type {
  InterviewCategory,
  CreateInterviewCategoryInput,
  UpdateInterviewCategoryInput,
} from '../types/interview-category'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useInterviewCategories() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<InterviewCategory[]>(SWR_KEYS.interviewCategories, () =>
    getAllInterviewCategories(),
  )

  const handleCreate = async (
    input: CreateInterviewCategoryInput,
  ): Promise<InterviewCategory> => {
    const newCategory = await createInterviewCategory(input)
    await mutate(SWR_KEYS.interviewCategories)
    return newCategory
  }

  const handleUpdate = async (
    id: number,
    input: UpdateInterviewCategoryInput,
  ): Promise<true> => {
    await updateInterviewCategory(id, input)
    await mutate(SWR_KEYS.interviewCategories)
    return true
  }

  const handleDelete = async (id: number): Promise<true> => {
    await deleteInterviewCategory(id)
    await mutate(SWR_KEYS.interviewCategories)
    await mutate(SWR_KEYS.interviewItems)
    return true
  }

  return {
    categories: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch interview categories'
      : null,
    createCategory: handleCreate,
    updateCategory: handleUpdate,
    deleteCategory: handleDelete,
  }
}
