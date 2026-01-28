'use client'

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
    return (
      <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-8 text-center dark:border-stone-800 dark:bg-stone-950/30">
        <p className="text-muted-foreground">取引がありません</p>
      </div>
    )
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
