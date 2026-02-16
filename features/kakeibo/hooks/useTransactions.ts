import useSWR from 'swr'
import { mutate } from 'swr'
import {
  getAllTransactions,
  getTransactionsByMonth,
  getTransactionsByDateRange,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../lib'
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../types/transaction'
import { SWR_KEYS, isTransactionsRelatedKey } from '@/lib/swr-keys'

export function useTransactions() {
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<Transaction[]>(SWR_KEYS.transactions, () =>
    getAllTransactions(),
  )

  const handleCreateTransaction = async (input: CreateTransactionInput) => {
    const result = await createTransaction(input)
    await mutate(SWR_KEYS.transactions)
    await mutate(isTransactionsRelatedKey)
    return result
  }

  const handleUpdateTransaction = async (
    id: number,
    input: UpdateTransactionInput,
  ) => {
    const result = await updateTransaction(id, input)
    await mutate(SWR_KEYS.transactions)
    await mutate(isTransactionsRelatedKey)
    return result
  }

  const handleDeleteTransaction = async (id: number) => {
    await deleteTransaction(id)
    await mutate(SWR_KEYS.transactions)
    await mutate(isTransactionsRelatedKey)
    return true
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
    refreshTransactions: () => mutate(SWR_KEYS.transactions),
  }
}

export function useTransactionsByMonth(year: number, month: number) {
  const key = SWR_KEYS.transactionsByMonth(year, month)
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<Transaction[]>(key, () =>
    getTransactionsByMonth(year, month),
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
  const key = SWR_KEYS.transactionsByDateRange(startDate, endDate)
  const {
    data = [],
    error,
    isLoading,
  } = useSWR<Transaction[]>(key, () =>
    getTransactionsByDateRange(startDate, endDate),
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
