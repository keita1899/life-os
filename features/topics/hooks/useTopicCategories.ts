import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllTopicCategories,
  createTopicCategory,
  updateTopicCategory,
  deleteTopicCategory,
  reorderTopicCategories,
} from '../lib'
import type {
  TopicCategory,
  CreateTopicCategoryInput,
  UpdateTopicCategoryInput,
} from '../types/topic-category'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useTopicCategories() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<TopicCategory[]>(SWR_KEYS.topicCategories, () =>
    getAllTopicCategories(),
  )

  const handleCreate = async (
    input: CreateTopicCategoryInput,
  ): Promise<TopicCategory> => {
    const newCategory = await createTopicCategory(input)
    await mutate(SWR_KEYS.topicCategories)
    return newCategory
  }

  const handleUpdate = async (
    id: number,
    input: UpdateTopicCategoryInput,
  ): Promise<true> => {
    await updateTopicCategory(id, input)
    await mutate(SWR_KEYS.topicCategories)
    return true
  }

  const handleDelete = async (id: number): Promise<true> => {
    await deleteTopicCategory(id)
    await mutate(SWR_KEYS.topicCategories)
    await mutate(SWR_KEYS.topics)
    return true
  }

  const handleReorderCategories = async (
    updates: { id: number; sortOrder: number }[],
  ): Promise<void> => {
    await reorderTopicCategories(updates)
    await mutate(SWR_KEYS.topicCategories)
  }

  return {
    categories: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch topic categories'
      : null,
    createCategory: handleCreate,
    updateCategory: handleUpdate,
    deleteCategory: handleDelete,
    reorderCategories: handleReorderCategories,
  }
}
