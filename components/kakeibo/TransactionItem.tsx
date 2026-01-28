'use client'

import { useMemo } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { formatDateDisplay } from '@/lib/date/formats'
import type { Transaction } from '@/lib/types/transaction'

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
  const formattedDate = useMemo(() => {
    return formatDateDisplay(transaction.date)
  }, [transaction.date])

  const amountColor = useMemo(() => {
    return transaction.type === 'income'
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400'
  }, [transaction.type])

  const typeLabel = transaction.type === 'income' ? '収入' : '支出'

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex-1">
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
          <span className={cn('font-semibold', amountColor)}>
            {transaction.amount.toLocaleString()}円
          </span>
          {categoryName && (
            <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
              {categoryName}
            </span>
          )}
          {!categoryName && (
            <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
              未分類
            </span>
          )}
        </div>
      </div>
      <div className="mt-0.5 flex min-w-[40px] items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">メニュー</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(transaction)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>編集</span>
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(transaction)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>削除</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
