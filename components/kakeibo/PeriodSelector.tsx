'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PeriodType } from '@/lib/transactions/period'

interface PeriodSelectorProps {
  periodType: PeriodType
  onPeriodTypeChange: (type: PeriodType) => void
  selectedYear: string
  onYearChange: (year: string) => void
  selectedMonth: string
  onMonthChange: (month: string) => void
  years: number[]
  months: number[]
}

export function PeriodSelector({
  periodType,
  onPeriodTypeChange,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  years,
  months,
}: PeriodSelectorProps) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant={periodType === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPeriodTypeChange('today')}
        >
          今日
        </Button>
        <Button
          type="button"
          variant={periodType === 'thisWeek' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPeriodTypeChange('thisWeek')}
        >
          今週
        </Button>
        <Button
          type="button"
          variant={periodType === 'thisMonth' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPeriodTypeChange('thisMonth')}
        >
          今月
        </Button>
        <Button
          type="button"
          variant={periodType === 'lastMonth' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPeriodTypeChange('lastMonth')}
        >
          先月
        </Button>
        <Button
          type="button"
          variant={periodType === 'thisYear' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPeriodTypeChange('thisYear')}
        >
          今年
        </Button>
        <Button
          type="button"
          variant={periodType === 'custom' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPeriodTypeChange('custom')}
        >
          カスタム
        </Button>
      </div>
      {periodType === 'custom' && (
        <div className="flex items-center gap-4">
          <Select value={selectedYear} onValueChange={onYearChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month.toString()}>
                  {month}月
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
