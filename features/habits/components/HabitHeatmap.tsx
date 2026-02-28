'use client'

import { format } from 'date-fns'
import { getWeekDays } from '@/features/calendar'
import type { Habit } from '../types/habit'
import type { HabitHeatmapViewMode } from '../hooks/useHabitHeatmapView'
import { HabitHeatmapMonthView } from './HabitHeatmapMonthView'
import { HabitHeatmapWeekView } from './HabitHeatmapWeekView'

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
  onRename?: (habit: Habit, name: string) => Promise<void>
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
  onRename,
}: HabitHeatmapProps) {
  const now = new Date()

  if (habits.length === 0) {
    return null
  }

  if (viewMode === 'week') {
    const weekDates = getWeekDays(focusDate, weekStartDay)
    const weekDateStrings = weekDates.map((d) => format(d, 'yyyy-MM-dd'))

    return (
      <div className="overflow-x-auto">
        <HabitHeatmapWeekView
          habits={habits}
          weekDates={weekDates}
          weekDateStrings={weekDateStrings}
          completedHabitIdsToday={completedHabitIdsToday}
          onToggleToday={onToggleToday}
          onToggleDate={onToggleDate}
          onEdit={onEdit}
          onDelete={onDelete}
          onRename={onRename}
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
      onRename={onRename}
    />
  )
}
