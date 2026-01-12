'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  getCalendarDays,
  formatDay,
  isCurrentMonth,
  isToday,
  getGoalsForDate,
  weekdays,
} from '@/lib/calendar/utils'
import type { MonthlyGoal } from '@/lib/types/monthly-goal'

interface MonthViewProps {
  currentDate: Date
  monthlyGoals: MonthlyGoal[]
}

export function MonthView({ currentDate, monthlyGoals }: MonthViewProps) {
  const calendarDays = useMemo(
    () => getCalendarDays(currentDate),
    [currentDate],
  )

  const weeks = useMemo(() => {
    const weeks: Date[][] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7))
    }
    return weeks
  }, [calendarDays])

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-px border border-stone-200 bg-stone-200 dark:border-stone-800 dark:bg-stone-800">
        {weekdays.map((day) => (
          <div
            key={day}
            className="bg-stone-50 px-2 py-2 text-center text-sm font-medium text-stone-700 dark:bg-stone-950 dark:text-stone-300"
          >
            {day}
          </div>
        ))}
        {weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const isCurrentMonthDay = isCurrentMonth(date, currentDate)
            const isTodayDate = isToday(date)
            const dayGoals = getGoalsForDate(monthlyGoals, date)

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={cn(
                  'min-h-[80px] bg-white p-1 dark:bg-stone-900',
                  !isCurrentMonthDay &&
                    'bg-stone-50 text-stone-400 dark:bg-stone-950 dark:text-stone-600',
                  isTodayDate && 'ring-2 ring-blue-500 dark:ring-blue-400',
                )}
              >
                <div
                  className={cn(
                    'mb-1 text-sm',
                    isTodayDate &&
                      'flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 font-semibold text-white dark:bg-blue-400',
                    !isTodayDate && 'font-medium',
                  )}
                >
                  {formatDay(date)}
                </div>
                <div className="space-y-0.5">
                  {dayGoals.slice(0, 2).map((goal) => (
                    <div
                      key={goal.id}
                      className="truncate rounded bg-blue-100 px-1 text-xs text-blue-900 dark:bg-blue-900/30 dark:text-blue-300"
                      title={goal.title}
                    >
                      {goal.title}
                    </div>
                  ))}
                  {dayGoals.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayGoals.length - 2}
                    </div>
                  )}
                </div>
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
