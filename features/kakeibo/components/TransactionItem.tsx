'use client'

import { useMemo } from 'react'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import { cn } from '@/lib/utils'
import { formatDateDisplay } from '@/lib/date/formats'
import type { Transaction } from '../types/transaction'

interface TransactionItemProps {
  transaction: Transaction
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
  categoryName?: string | null
}

export function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  categoryName,
}: TransactionItemProps) {
  const formattedDate = useMemo(
    () => formatDateDisplay(transaction.date),
    [transaction.date],
  )
  const amountColor = useMemo(
    () =>
      transaction.type === 'income'
        ? 'text-green-600 dark:text-green-400'
        : 'text-red-600 dark:text-red-400',
    [transaction.type],
  )
  const typeLabel = transaction.type === 'income' ? '収入' : '支出'

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-stone-200/60 bg-stone-900/10 p-4 dark:border-stone-700/40 dark:bg-stone-900/20">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
            {transaction.name}
          </div>
          <span
            className={cn(
              'rounded-md px-2 py-0.5 text-xs font-medium',
              transaction.type === 'income'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            )}
          >
            {typeLabel}
          </span>
          {transaction.type === 'expense' && (
            <span
              className={cn(
                'rounded-md px-2 py-0.5 text-xs font-medium',
                transaction.isFixed
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
              )}
            >
              {transaction.isFixed ? '固定' : '変動'}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{formattedDate}</span>
          {categoryName ? (
            <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
              {categoryName}
            </span>
          ) : (
            <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
              未分類
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-start gap-1">
        <div
          className={cn(
            'pt-0.5 text-sm font-semibold tabular-nums',
            amountColor,
          )}
        >
          {transaction.amount.toLocaleString()}円
        </div>
        <EditDeleteDropdownMenu
          onEdit={onEdit ? () => onEdit(transaction) : undefined}
          onDelete={onDelete ? () => onDelete(transaction) : undefined}
          triggerClassName="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2"
        />
      </div>
    </div>
  )
}
