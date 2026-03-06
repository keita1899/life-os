import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllTopicItems,
  createTopicItem,
  updateTopicItem,
  deleteTopicItem,
  reorderTopicItems,
} from '../lib'
import type {
  TopicItem,
  CreateTopicItemInput,
  UpdateTopicItemInput,
} from '../types/topic-item'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useTopicItems() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<TopicItem[]>(SWR_KEYS.topics, () =>
    getAllTopicItems(),
  )

  const handleCreate = async (input: CreateTopicItemInput): Promise<true> => {
    await createTopicItem(input)
    await mutate(SWR_KEYS.topics)
    return true
  }

  const handleUpdate = async (
    id: number,
    input: UpdateTopicItemInput,
  ): Promise<true> => {
    await updateTopicItem(id, input)
    await mutate(SWR_KEYS.topics)
    return true
  }

  const handleDelete = async (id: number): Promise<true> => {
    await deleteTopicItem(id)
    await mutate(SWR_KEYS.topics)
    return true
  }

  const handleReorder = async (
    updates: { id: number; order: number }[],
  ) => {
    await reorderTopicItems(updates)
    await mutate(SWR_KEYS.topics)
  }

  return {
    items: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch topic items'
      : null,
    createItem: handleCreate,
    updateItem: handleUpdate,
    deleteItem: handleDelete,
    reorderItems: handleReorder,
  }
}
