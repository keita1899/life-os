'use client'

import { useState } from 'react'
import { isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getCalendarDays,
  getWeekdays,
  formatMonthYear,
  formatDay,
  isCurrentMonth,
  isToday,
  navigateMonth,
} from '@/features/calendar/lib/utils'
import { cn } from '@/lib/utils'

interface MiniCalendarProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  weekStartDay?: number
}

export function MiniCalendar({
  selectedDate,
  onSelectDate,
  weekStartDay = 0,
}: MiniCalendarProps) {
  const [viewMonth, setViewMonth] = useState(selectedDate)

  const days = getCalendarDays(viewMonth, weekStartDay)
  const weekdayLabels = getWeekdays(weekStartDay)

  return (
    <div className="w-64">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setViewMonth(navigateMonth(viewMonth, 'prev'))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{formatMonthYear(viewMonth)}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setViewMonth(navigateMonth(viewMonth, 'next'))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-0">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="text-center text-xs text-muted-foreground py-1"
          >
            {label}
          </div>
        ))}

        {days.map((day) => {
          const inMonth = isCurrentMonth(day, viewMonth)
          const today = isToday(day)
          const selected = isSameDay(day, selectedDate)

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              className={cn(
                'h-7 w-full text-xs rounded-md transition-colors hover:bg-accent',
                !inMonth && 'text-muted-foreground/40',
                today && !selected && 'text-blue-500 font-bold',
                selected && 'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
            >
              {formatDay(day)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
