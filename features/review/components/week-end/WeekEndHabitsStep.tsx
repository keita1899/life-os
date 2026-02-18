'use client'

import { useMemo } from 'react'
import { useHabits, useHabitCompletionsByDateRange, isHabitDueOnDate } from '@/features/habits'
import { getWeekDays } from '@/features/calendar'
import { EmptyState } from '@/components/ui/empty-state'

interface WeekEndHabitsStepProps {
  weekStartDate: Date
  weekStartDateStr: string
  weekEndDateStr: string
  weekStartDay: number
}

function HabitRateRow({
  habit,
  weekStartDateStr,
  weekEndDateStr,
  weekStartDate,
  weekStartDay,
}: {
  habit: import('@/features/habits').Habit
  weekStartDateStr: string
  weekEndDateStr: string
  weekStartDate: Date
  weekStartDay: number
}) {
  const { completions, isLoading } = useHabitCompletionsByDateRange(
    habit.id,
    weekStartDateStr,
    weekEndDateStr,
  )
  const weekDays = useMemo(
    () => getWeekDays(weekStartDate, weekStartDay),
    [weekStartDate, weekStartDay],
  )

  const rate = useMemo(() => {
    let due = 0
    let completed = 0
    const completedSet = new Set(completions.map((c) => c.completedDate))
    weekDays.forEach((day) => {
      if (isHabitDueOnDate(habit, day)) {
        due++
        const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
        if (completedSet.has(dateStr)) completed++
      }
    })
    return due > 0 ? Math.round((completed / due) * 100) : null
  }, [habit, completions, weekDays])

  if (isLoading) return null

  return (
    <div className="flex items-center justify-between border-b border-stone-200 py-3 last:border-0 dark:border-stone-800">
      <span className="font-medium">{habit.name}</span>
      <span className="tabular-nums text-muted-foreground">
        {rate !== null ? `${rate}%` : '−'}
      </span>
    </div>
  )
}

export function WeekEndHabitsStep({
  weekStartDate,
  weekStartDateStr,
  weekEndDateStr,
  weekStartDay,
}: WeekEndHabitsStepProps) {
  const { habits } = useHabits()

  if (habits.length === 0) {
    return <EmptyState message="習慣がありません" />
  }

  return (
    <div className="space-y-1">
      {habits.map((habit) => (
        <HabitRateRow
          key={habit.id}
          habit={habit}
          weekStartDateStr={weekStartDateStr}
          weekEndDateStr={weekEndDateStr}
          weekStartDate={weekStartDate}
          weekStartDay={weekStartDay}
        />
      ))}
    </div>
  )
}
