import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllTransactionCategories,
  createTransactionCategory,
  updateTransactionCategory,
  deleteTransactionCategory,
} from '../lib'
import type {
  TransactionCategory,
  CreateTransactionCategoryInput,
  UpdateTransactionCategoryInput,
} from '../types/transaction-category'
import { fetcher } from '@/lib/swr'
import { SWR_KEYS } from '@/lib/swr-keys'

type TransactionCategoryType = 'income' | 'expense'

export function useTransactionCategories(type: TransactionCategoryType) {
  const key = SWR_KEYS.transactionCategories(type)
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<TransactionCategory[]>(key, () =>
    fetcher(() => getAllTransactionCategories(type)),
  )

  const handleCreateTransactionCategory = async (
    input: CreateTransactionCategoryInput,
  ): Promise<TransactionCategory> => {
    const newCategory = await createTransactionCategory(type, input)
    await mutate(key)
    return newCategory
  }

  const handleUpdateTransactionCategory = async (
    id: number,
    input: UpdateTransactionCategoryInput,
  ) => {
    await updateTransactionCategory(type, id, input)
    await Promise.all([
      mutate(key),
      mutate(SWR_KEYS.transactions),
    ])
  }

  const handleDeleteTransactionCategory = async (id: number) => {
    await deleteTransactionCategory(type, id)
    await Promise.all([
      mutate(key),
      mutate(SWR_KEYS.transactions),
    ])
  }

  return {
    categories: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch transaction categories'
      : null,
    createTransactionCategory: handleCreateTransactionCategory,
    updateTransactionCategory: handleUpdateTransactionCategory,
    deleteTransactionCategory: handleDeleteTransactionCategory,
    refreshCategories: () => mutate(key),
  }
}
