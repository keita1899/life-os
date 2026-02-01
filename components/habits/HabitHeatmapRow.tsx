'use client'

import { getDate, endOfMonth } from 'date-fns'
import { useHabitCompletions } from '@/hooks/useHabitCompletions'
import { isHabitDueOnDate, formatHabitScheduledTime } from '@/lib/habits'
import type { Habit } from '@/lib/types/habit'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'

export interface HabitHeatmapRowProps {
  habit: Habit
  year: number
  month: number
  todayDay: number | null
  completedHabitIdsToday: Set<number>
  onToggleToday?: (habit: Habit) => void
  onEdit?: (habit: Habit) => void
  onDelete?: (habit: Habit) => void
}

export function HabitHeatmapRow({
  habit,
  year,
  month,
  todayDay,
  completedHabitIdsToday,
  onToggleToday,
  onEdit,
  onDelete,
}: HabitHeatmapRowProps) {
  const { completions, isLoading } = useHabitCompletions(
    habit.id,
    year,
    month,
  )
  const completedDateSet = new Set(completions.map((c) => c.completedDate))
  const lastDay = getDate(endOfMonth(new Date(year, month - 1)))
  const isViewingCurrentMonth = todayDay !== null

  if (isLoading) {
    return (
      <tr>
        <td className="w-12 shrink-0 border-b border-stone-200 px-2 py-1.5 dark:border-stone-800" />
        <td className="border-b border-stone-200 px-2 py-1.5 text-sm dark:border-stone-800">
          {habit.name}
        </td>
        <td
          colSpan={lastDay + 2}
          className="border-b border-stone-200 px-2 py-1.5 text-xs text-muted-foreground dark:border-stone-800"
        >
          読み込み中...
        </td>
      </tr>
    )
  }

  let dueCount = 0
  let completedCount = 0
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month - 1, day)
    if (isHabitDueOnDate(habit, date)) {
      dueCount++
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      if (completedDateSet.has(dateStr)) completedCount++
    }
  }
  const rate =
    dueCount > 0 ? Math.round((completedCount / dueCount) * 100) : null

  return (
    <tr className="group">
      <td className="w-12 shrink-0 border-b border-stone-200 px-2 py-1.5 text-right text-xs tabular-nums text-muted-foreground dark:border-stone-800">
        {formatHabitScheduledTime(habit.scheduledTime) || '−'}
      </td>
      <td className="max-w-[140px] truncate border-b border-stone-200 px-2 py-1.5 text-sm dark:border-stone-800">
        {habit.name}
      </td>
      {Array.from({ length: lastDay }, (_, i) => i + 1).map((day) => {
        const date = new Date(year, month - 1, day)
        const isDue = isHabitDueOnDate(habit, date)
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const isToday = todayDay !== null && day === todayDay
        const completed = isToday
          ? completedHabitIdsToday.has(habit.id)
          : completedDateSet.has(dateStr)
        const canToggleToday =
          isViewingCurrentMonth &&
          isToday &&
          isDue &&
          onToggleToday !== undefined

        return (
          <td
            key={day}
            className={cn(
              'border-b border-stone-200 p-0.5 dark:border-stone-800',
              isToday && 'bg-green-100 dark:bg-green-950/50',
            )}
          >
            {isDue ? (
              canToggleToday ? (
                <button
                  type="button"
                  onClick={() => onToggleToday(habit)}
                  className={cn(
                    'block h-4 w-4 rounded-sm focus:outline-none',
                    completed
                      ? 'bg-green-500 dark:bg-green-600'
                      : 'bg-stone-100 dark:bg-stone-800 hover:opacity-80',
                  )}
                  title={`${day}日${completed ? ' 完了 (クリックで未完了)' : ' (クリックで完了)'}`}
                />
              ) : (
                <span
                  className={cn(
                    'block h-4 w-4 rounded-sm',
                    completed
                      ? 'bg-green-500 dark:bg-green-600'
                      : 'bg-stone-100 dark:bg-stone-800',
                  )}
                  title={`${day}日${completed ? ' 完了' : ''}${isToday ? ' (今日)' : ''}`}
                />
              )
            ) : (
              <span className="block h-4 w-4 rounded-sm bg-transparent" />
            )}
          </td>
        )
      })}
      <td className="w-14 shrink-0 border-b border-stone-200 px-2 py-1.5 text-right text-xs tabular-nums text-muted-foreground dark:border-stone-800">
        {rate !== null ? `${rate}%` : '−'}
      </td>
      <td className="w-12 shrink-0 border-b border-stone-200 p-1 dark:border-stone-800">
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">メニューを開く</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(habit)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  編集
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(habit)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </td>
    </tr>
  )
}
