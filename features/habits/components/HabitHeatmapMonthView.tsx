'use client'

import { getDate, endOfMonth } from 'date-fns'
import { cn } from '@/lib/utils'
import { HabitHeatmapRow } from './HabitHeatmapRow'
import type { Habit } from '../types/habit'

interface HabitHeatmapMonthViewProps {
  habits: Habit[]
  year: number
  month: number
  todayDay: number | null
  completedHabitIdsToday: Set<number>
  onToggleToday?: (habit: Habit) => void
  onToggleDate?: (habit: Habit, dateStr: string) => void
  onEdit?: (habit: Habit) => void
  onDelete?: (habit: Habit) => void
  onRename?: (habit: Habit, name: string) => Promise<void>
}

export function HabitHeatmapMonthView({
  habits,
  year,
  month,
  todayDay,
  completedHabitIdsToday,
  onToggleToday,
  onToggleDate,
  onEdit,
  onDelete,
  onRename,
}: HabitHeatmapMonthViewProps) {
  const lastDay = getDate(endOfMonth(new Date(year, month - 1)))

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[200px] border-collapse text-left">
        <thead>
          <tr>
            <th className="w-12 shrink-0 border-b border-stone-200 bg-stone-50 px-2 py-2 text-right text-xs font-medium text-muted-foreground dark:border-stone-800 dark:bg-stone-950">
              時間
            </th>
            <th className="border-b border-stone-200 bg-stone-50 px-2 py-2 text-xs font-medium text-muted-foreground dark:border-stone-800 dark:bg-stone-950">
              習慣
            </th>
            {Array.from({ length: lastDay }, (_, i) => i + 1).map((day) => (
              <th
                key={day}
                className={cn(
                  'w-5 border-b border-stone-200 bg-stone-50 p-0.5 text-center text-[10px] text-muted-foreground dark:border-stone-800 dark:bg-stone-950',
                  todayDay === day && 'bg-green-100 dark:bg-green-950/50',
                )}
              >
                {day}
              </th>
            ))}
            <th className="w-14 shrink-0 border-b border-stone-200 bg-stone-50 px-2 py-2 text-right text-xs font-medium text-muted-foreground dark:border-stone-800 dark:bg-stone-950">
              達成率
            </th>
            <th className="w-12 shrink-0 border-b border-stone-200 bg-stone-50 px-2 py-2 dark:border-stone-800 dark:bg-stone-950" />
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => (
            <HabitHeatmapRow
              key={habit.id}
              habit={habit}
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
          ))}
        </tbody>
      </table>
    </div>
  )
}
