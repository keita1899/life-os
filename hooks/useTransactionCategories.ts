import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllTransactionCategories,
  createTransactionCategory,
  updateTransactionCategory,
  deleteTransactionCategory,
} from '@/lib/transactions'
import type {
  TransactionCategory,
  CreateTransactionCategoryInput,
  UpdateTransactionCategoryInput,
} from '@/lib/types/transaction-category'
import { fetcher } from '@/lib/swr'

type TransactionCategoryType = 'income' | 'expense'

function getTransactionCategoriesKey(type: TransactionCategoryType): string {
  return `transaction-categories-${type}`
}

export function useTransactionCategories(type: TransactionCategoryType) {
  const key = getTransactionCategoriesKey(type)
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
      mutate('transactions'),
    ])
  }

  const handleDeleteTransactionCategory = async (id: number) => {
    await deleteTransactionCategory(type, id)
    await Promise.all([
      mutate(key),
      mutate('transactions'),
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
