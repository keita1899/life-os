'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { TransactionCategory } from '@/lib/types/transaction-category'

interface CategoryFilterProps {
  filterType: 'all' | 'income' | 'expense' | 'fixed' | 'variable'
  filterCategoryId: string
  onCategoryChange: (categoryId: string) => void
  incomeCategories: TransactionCategory[]
  expenseCategories: TransactionCategory[]
}

export function CategoryFilter({
  filterType,
  filterCategoryId,
  onCategoryChange,
  incomeCategories,
  expenseCategories,
}: CategoryFilterProps) {
  const placeholder =
    filterType === 'all'
      ? 'カテゴリー'
      : filterType === 'income'
      ? '収入カテゴリー'
      : '支出カテゴリー'

  return (
    <Select
      value={filterCategoryId === 'all' ? undefined : filterCategoryId}
      onValueChange={(value) => {
        onCategoryChange(value ?? 'all')
      }}
      disabled={filterType === 'all'}
    >
      <SelectTrigger
        className={cn('w-[180px]', filterType === 'all' && 'opacity-50')}
      >
        {filterCategoryId === 'all' || filterType === 'all' ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">すべてのカテゴリー</SelectItem>
        <SelectItem value="none">未分類</SelectItem>
        {filterType === 'income'
          ? incomeCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))
          : filterType !== 'all'
          ? expenseCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))
          : null}
      </SelectContent>
    </Select>
  )
}
