import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllTransactions,
  getTransactionsByMonth,
  getTransactionsByDateRange,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/lib/transactions'
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '@/lib/types/transaction'
import { fetcher } from '@/lib/swr'

const transactionsKey = 'transactions'

export function useTransactions() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<Transaction[]>(transactionsKey, () =>
    fetcher(() => getAllTransactions()),
  )

  const handleCreateTransaction = async (input: CreateTransactionInput) => {
    await createTransaction(input)
    await mutate(transactionsKey)
    await mutate(
      (key) => typeof key === 'string' && key.startsWith(`${transactionsKey}-`),
    )
  }

  const handleUpdateTransaction = async (
    id: number,
    input: UpdateTransactionInput,
  ) => {
    await updateTransaction(id, input)
    await mutate(transactionsKey)
    await mutate(
      (key) => typeof key === 'string' && key.startsWith(`${transactionsKey}-`),
    )
  }

  const handleDeleteTransaction = async (id: number) => {
    await deleteTransaction(id)
    await mutate(transactionsKey)
    await mutate(
      (key) => typeof key === 'string' && key.startsWith(`${transactionsKey}-`),
    )
  }

  return {
    transactions: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch transactions'
      : null,
    createTransaction: handleCreateTransaction,
    updateTransaction: handleUpdateTransaction,
    deleteTransaction: handleDeleteTransaction,
    refreshTransactions: () => mutate(transactionsKey),
  }
}

export function useTransactionsByMonth(year: number, month: number) {
  const key = `${transactionsKey}-${year}-${month}`
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<Transaction[]>(key, () =>
    fetcher(() => getTransactionsByMonth(year, month)),
  )

  return {
    transactions: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch transactions'
      : null,
  }
}

export function useTransactionsByDateRange(startDate: string, endDate: string) {
  const key = `${transactionsKey}-range-${startDate}-${endDate}`
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<Transaction[]>(key, () =>
    fetcher(() => getTransactionsByDateRange(startDate, endDate)),
  )

  return {
    transactions: data,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch transactions'
      : null,
  }
}
