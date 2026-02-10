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
  return (
    <div className="mb-3 flex flex-wrap gap-2">
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
        variant={filterType === 'expense' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterTypeChange('expense')}
      >
        支出
      </Button>
      <Button
        type="button"
        variant={filterType === 'fixed' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterTypeChange('fixed')}
      >
        固定支出
      </Button>
      <Button
        type="button"
        variant={filterType === 'variable' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterTypeChange('variable')}
      >
        変動支出
      </Button>
    </div>
  )
}
