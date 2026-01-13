'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  getWeekDays,
  formatDay,
  isToday,
  getGoalsForDate,
  weekdays,
} from '@/lib/calendar/utils'
import { WeeklyGoalForm } from '@/components/goals/WeeklyGoalForm'
import type { MonthlyGoal } from '@/lib/types/monthly-goal'
import type { WeeklyGoal } from '@/lib/types/weekly-goal'

interface WeekViewProps {
  currentDate: Date
  monthlyGoals: MonthlyGoal[]
  weeklyGoals: WeeklyGoal[]
}

export function WeekView({
  currentDate,
  monthlyGoals,
  weeklyGoals,
}: WeekViewProps) {
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate])

  return (
    <div className="w-full">
      <WeeklyGoalForm currentDate={currentDate} weeklyGoals={weeklyGoals} />
      <div className="grid grid-cols-7 gap-px border border-stone-200 bg-stone-200 dark:border-stone-800 dark:bg-stone-800">
        {weekdays.map((day) => (
          <div
            key={day}
            className="bg-stone-50 px-2 py-2 text-center text-sm font-medium text-stone-700 dark:bg-stone-950 dark:text-stone-300"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px border-x border-b border-stone-200 bg-stone-200 dark:border-stone-800 dark:bg-stone-800">
        {weekDays.map((date) => {
          const isTodayDate = isToday(date)
          const dayGoals = getGoalsForDate(monthlyGoals, date)

          return (
            <div
              key={date.toISOString()}
              className={cn(
                'min-h-[400px] bg-white p-2 dark:bg-stone-950',
                isTodayDate && 'ring-2 ring-blue-500 dark:ring-blue-400',
              )}
            >
              <div
                className={cn(
                  'mb-2 text-sm',
                  isTodayDate &&
                    'flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 font-semibold text-white dark:bg-blue-400',
                  !isTodayDate && 'font-medium',
                )}
              >
                {formatDay(date)}
              </div>
              <div className="space-y-1.5">
                {dayGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded bg-blue-100 px-2 py-1.5 text-xs text-blue-900 dark:bg-blue-900/30 dark:text-blue-300"
                    title={goal.title}
                  >
                    <div className="font-medium line-clamp-2">{goal.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
