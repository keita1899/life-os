import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllRuleCategories,
  createRuleCategory,
  updateRuleCategory,
  deleteRuleCategory,
  reorderRuleCategories,
} from '../lib'
import type {
  RuleCategory,
  CreateRuleCategoryInput,
  UpdateRuleCategoryInput,
} from '../types/rule-category'
import { SWR_KEYS } from '@/lib/swr-keys'

export function useRuleCategories() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<RuleCategory[]>(SWR_KEYS.ruleCategories, () =>
    getAllRuleCategories(),
  )

  const handleCreateRuleCategory = async (
    input: CreateRuleCategoryInput,
  ): Promise<RuleCategory> => {
    const newCategory = await createRuleCategory(input)
    await mutate(SWR_KEYS.ruleCategories)
    return newCategory
  }

  const handleUpdateRuleCategory = async (
    id: number,
    input: UpdateRuleCategoryInput,
  ): Promise<true> => {
    await updateRuleCategory(id, input)
    await mutate(SWR_KEYS.ruleCategories)
    return true
  }

  const handleDeleteRuleCategory = async (id: number): Promise<true> => {
    await deleteRuleCategory(id)
    await mutate(SWR_KEYS.ruleCategories)
    await mutate(SWR_KEYS.rules)
    return true
  }

  const handleReorderCategories = async (
    updates: { id: number; sortOrder: number }[],
  ): Promise<void> => {
    await reorderRuleCategories(updates)
    await mutate(SWR_KEYS.ruleCategories)
  }

  return {
    categories: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch rule categories'
      : null,
    createRuleCategory: handleCreateRuleCategory,
    updateRuleCategory: handleUpdateRuleCategory,
    deleteRuleCategory: handleDeleteRuleCategory,
    reorderCategories: handleReorderCategories,
  }
}
