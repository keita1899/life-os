'use client'

import { Button } from '@/components/ui/button'

type FilterType = 'all' | 'income' | 'expense' | 'fixed' | 'variable'

interface TransactionTypeFilterProps {
  filterType: FilterType
  onFilterTypeChange: (type: FilterType) => void
}

export function TransactionTypeFilter({
  filterType,
  onFilterTypeChange,
}: TransactionTypeFilterProps) {
  const isExpenseGroup =
    filterType === 'expense' ||
    filterType === 'fixed' ||
    filterType === 'variable'

  return (
    <div className="mb-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={filterType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterTypeChange('all')}
        >
          すべて
        </Button>
        <Button
          type="button"
          variant={filterType === 'income' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterTypeChange('income')}
        >
          収入
        </Button>
        <Button
          type="button"
          variant={isExpenseGroup ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterTypeChange('expense')}
        >
          支出
        </Button>
      </div>
      {isExpenseGroup && (
        <div className="flex flex-wrap gap-1.5 pl-4">
          <Button
            type="button"
            variant={filterType === 'expense' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => onFilterTypeChange('expense')}
          >
            すべて
          </Button>
          <Button
            type="button"
            variant={filterType === 'fixed' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => onFilterTypeChange('fixed')}
          >
            固定
          </Button>
          <Button
            type="button"
            variant={filterType === 'variable' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => onFilterTypeChange('variable')}
          >
            変動
          </Button>
        </div>
      )}
    </div>
  )
}
