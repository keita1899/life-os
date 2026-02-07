'use client'

import { format } from 'date-fns'
import { getWeekDays } from '@/lib/calendar/utils'
import type { Habit } from '@/lib/types/habit'
import type { HabitHeatmapViewMode } from '@/hooks/useHabitHeatmapView'
import { HabitHeatmapMonthView } from '@/components/habits/HabitHeatmapMonthView'
import { HabitHeatmapWeekView } from '@/components/habits/HabitHeatmapWeekView'

interface HabitHeatmapProps {
  habits: Habit[]
  viewMode: HabitHeatmapViewMode
  focusDate: Date
  weekStartDay?: number
  year: number
  month: number
  completedHabitIdsToday?: Set<number>
  onToggleToday?: (habit: Habit) => void
  onToggleDate?: (habit: Habit, dateStr: string) => void
  onEdit?: (habit: Habit) => void
  onDelete?: (habit: Habit) => void
}

export function HabitHeatmap({
  habits,
  viewMode,
  focusDate,
  weekStartDay = 1,
  year,
  month,
  completedHabitIdsToday = new Set(),
  onToggleToday,
  onToggleDate,
  onEdit,
  onDelete,
}: HabitHeatmapProps) {
  const now = new Date()

  if (habits.length === 0) {
    return null
  }

  if (viewMode === 'week') {
    const weekDates = getWeekDays(focusDate, weekStartDay)
    const weekDateStrings = weekDates.map((d) => format(d, 'yyyy-MM-dd'))
    const first = weekDates[0]
    const last = weekDates[6]
    const primaryYear = first.getFullYear()
    const primaryMonth = first.getMonth() + 1
    const secondaryYear = last.getFullYear()
    const secondaryMonth = last.getMonth() + 1

    return (
      <div className="overflow-x-auto">
        <HabitHeatmapWeekView
          habits={habits}
          weekDates={weekDates}
          weekDateStrings={weekDateStrings}
          primaryYear={primaryYear}
          primaryMonth={primaryMonth}
          secondaryYear={secondaryYear}
          secondaryMonth={secondaryMonth}
          completedHabitIdsToday={completedHabitIdsToday}
          onToggleToday={onToggleToday}
          onToggleDate={onToggleDate}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    )
  }

  const todayDay =
    now.getFullYear() === year && now.getMonth() + 1 === month
      ? now.getDate()
      : null

  return (
    <HabitHeatmapMonthView
      habits={habits}
      year={year}
      month={month}
      todayDay={todayDay}
      completedHabitIdsToday={completedHabitIdsToday}
      onToggleToday={onToggleToday}
      onToggleDate={onToggleDate}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}
