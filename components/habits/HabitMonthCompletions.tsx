'use client'

import { getDate, endOfMonth } from 'date-fns'
import { useHabitCompletions } from '@/hooks/useHabitCompletions'
import { isHabitDueOnDate } from '@/lib/habits'
import type { Habit } from '@/lib/types/habit'

interface HabitMonthCompletionsProps {
  habit: Habit
  year: number
  month: number
}

export function HabitMonthCompletions({
  habit,
  year,
  month,
}: HabitMonthCompletionsProps) {
  const { completions, isLoading } = useHabitCompletions(
    habit.id,
    year,
    month,
  )

  if (isLoading) {
    return (
      <div className="h-6 flex items-center text-sm text-muted-foreground">
        読み込み中...
      </div>
    )
  }

  const completedDateSet = new Set(
    completions.map((c) => c.completedDate),
  )
  const lastDay = getDate(endOfMonth(new Date(year, month - 1)))

  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: lastDay }, (_, i) => i + 1).map((day) => {
        const date = new Date(year, month - 1, day)
        const isDue = isHabitDueOnDate(habit, date)
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const completed = completedDateSet.has(dateStr)
        return (
          <div
            key={day}
            className="flex flex-col items-center gap-0.5 shrink-0"
          >
            <span className="text-[10px] leading-none text-muted-foreground tabular-nums">
              {day}
            </span>
            {isDue ? (
              <span
                className={`inline-block h-2.5 w-2.5 rounded-sm ${
                  completed
                    ? 'bg-stone-600 dark:bg-stone-400'
                    : 'bg-stone-200 dark:bg-stone-700'
                }`}
                title={`${day}日${completed ? ' 完了' : ''}`}
              />
            ) : (
              <span className="inline-flex h-2.5 w-2.5 shrink-0 items-center justify-center text-[10px] text-muted-foreground">
                −
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
