import useSWR from 'swr'
import { mutate } from 'swr'
import {
  createRuleItem,
  getAllRuleItems,
  updateRuleItem,
  deleteRuleItem,
  reorderRuleItems,
} from '../lib'
import type {
  RuleItem,
  CreateRuleItemInput,
  UpdateRuleItemInput,
} from '../types/rule-item'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useRules() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<RuleItem[]>(SWR_KEYS.rules, () =>
    getAllRuleItems(),
  )

  const handleCreateRuleItem = async (input: CreateRuleItemInput) => {
    await createRuleItem(input)
    await mutate(SWR_KEYS.rules)
  }

  const handleUpdateRuleItem = async (
    id: number,
    input: UpdateRuleItemInput,
  ) => {
    await updateRuleItem(id, input)
    await mutate(SWR_KEYS.rules)
  }

  const handleDeleteRuleItem = async (id: number) => {
    await deleteRuleItem(id)
    await mutate(SWR_KEYS.rules)
  }

  const handleReorderRuleItems = async (
    updates: { id: number; order: number }[],
  ) => {
    await reorderRuleItems(updates)
    await mutate(SWR_KEYS.rules)
  }

  return {
    items: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch rule items'
      : null,
    createRuleItem: handleCreateRuleItem,
    updateRuleItem: handleUpdateRuleItem,
    deleteRuleItem: handleDeleteRuleItem,
    reorderRuleItems: handleReorderRuleItems,
  }
}
