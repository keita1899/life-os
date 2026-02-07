'use client'

import { EmptyState } from '@/components/ui/empty-state'
import { TransactionItem } from './TransactionItem'
import type { Transaction } from '@/lib/types/transaction'
import { useTransactionCategories } from '@/hooks/useTransactionCategories'
import { useMemo } from 'react'

interface TransactionListProps {
  transactions: Transaction[]
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const incomeCategories = useTransactionCategories('income')
  const expenseCategories = useTransactionCategories('expense')

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>()
    incomeCategories.categories.forEach((cat) => {
      map.set(cat.id, cat.name)
    })
    expenseCategories.categories.forEach((cat) => {
      map.set(cat.id, cat.name)
    })
    return map
  }, [incomeCategories.categories, expenseCategories.categories])

  if (transactions.length === 0) {
    return <EmptyState message="取引がありません" />
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
          categoryName={
            transaction.categoryId
              ? categoryMap.get(transaction.categoryId) || null
              : null
          }
        />
      ))}
    </div>
  )
}
