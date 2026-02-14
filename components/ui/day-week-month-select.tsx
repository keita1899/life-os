'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type DayWeekMonth = 'day' | 'week' | 'month'

interface DayWeekMonthSelectProps {
  value: DayWeekMonth
  onValueChange: (value: DayWeekMonth) => void
  triggerClassName?: string
}

export function DayWeekMonthSelect({
  value,
  onValueChange,
  triggerClassName,
}: DayWeekMonthSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v === 'day' || v === 'week' || v === 'month') {
          onValueChange(v)
        }
      }}
    >
      <SelectTrigger className={triggerClassName ?? 'w-24'}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="day">
          <span className="flex w-full items-center justify-between">
            <span>日</span>
            <span className="ml-2 text-xs text-muted-foreground">D</span>
          </span>
        </SelectItem>
        <SelectItem value="week">
          <span className="flex w-full items-center justify-between">
            <span>週</span>
            <span className="ml-2 text-xs text-muted-foreground">W</span>
          </span>
        </SelectItem>
        <SelectItem value="month">
          <span className="flex w-full items-center justify-between">
            <span>月</span>
            <span className="ml-2 text-xs text-muted-foreground">M</span>
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
