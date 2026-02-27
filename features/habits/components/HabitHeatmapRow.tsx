'use client'

import { getDate, endOfMonth } from 'date-fns'
import { useHabitCompletions } from '../hooks/useHabitCompletions'
import { isHabitDueOnDate, formatHabitScheduledTime } from '../lib'
import type { Habit } from '../types/habit'
import { cn } from '@/lib/utils'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'

export interface HabitHeatmapRowProps {
  habit: Habit
  year: number
  month: number
  todayDay: number | null
  completedHabitIdsToday: Set<number>
  onToggleToday?: (habit: Habit) => void
  onToggleDate?: (habit: Habit, dateStr: string) => void
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
  onToggleDate,
  onEdit,
  onDelete,
}: HabitHeatmapRowProps) {
  const { completions, isLoading, error } = useHabitCompletions(
    habit.id,
    year,
    month,
  )
  const completedDateSet = new Set(completions.map((c) => c.completedDate))
  const lastDay = getDate(endOfMonth(new Date(year, month - 1)))
  const habitCreatedDate = habit.createdAt.slice(0, 10)
  const displayedYearMonth = `${year}-${String(month).padStart(2, '0')}`
  const isNewThisMonth = habit.createdAt.slice(0, 7) === displayedYearMonth

  if (error) {
    return (
      <tr>
        <td className="w-12 shrink-0 border-b border-stone-200 px-2 py-3 dark:border-stone-800" />
        <td className="border-b border-stone-200 px-2 py-3 text-sm dark:border-stone-800">
          {habit.name}
        </td>
        <td
          colSpan={lastDay + 2}
          className="border-b border-stone-200 px-2 py-3 text-xs text-destructive dark:border-stone-800"
        >
          取得エラー: {error}
        </td>
      </tr>
    )
  }

  if (isLoading) {
    return (
      <tr>
        <td className="w-12 shrink-0 border-b border-stone-200 px-2 py-3 dark:border-stone-800" />
        <td className="border-b border-stone-200 px-2 py-3 text-sm dark:border-stone-800">
          {habit.name}
        </td>
        <td
          colSpan={lastDay + 2}
          className="border-b border-stone-200 px-2 py-3 text-xs text-muted-foreground dark:border-stone-800"
        >
          読み込み中...
        </td>
      </tr>
    )
  }

  let dueCount = 0
  let completedCount = 0
  for (let day = 1; day <= lastDay; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (dateStr < habitCreatedDate) continue
    const date = new Date(year, month - 1, day)
    if (isHabitDueOnDate(habit, date)) {
      dueCount++
      if (completedDateSet.has(dateStr)) completedCount++
    }
  }
  const rate =
    dueCount > 0 ? Math.round((completedCount / dueCount) * 100) : null

  return (
    <tr className={cn('group', isNewThisMonth && 'bg-amber-50/60 dark:bg-amber-950/20')}>
      <td className="w-12 shrink-0 border-b border-stone-200 px-2 py-3 text-right text-xs tabular-nums text-muted-foreground dark:border-stone-800">
        {formatHabitScheduledTime(habit.scheduledTime) || '−'}
      </td>
      <td className="max-w-[140px] truncate border-b border-stone-200 px-2 py-3 text-sm dark:border-stone-800">
        <span className="flex items-center gap-1.5">
          {habit.name}
          {isNewThisMonth && (
            <span className="inline-flex shrink-0 rounded-full bg-amber-200 px-1.5 py-0.5 text-[10px] font-medium leading-none text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              NEW
            </span>
          )}
        </span>
      </td>
      {(() => {
      const now = new Date()
      return Array.from({ length: lastDay }, (_, i) => i + 1).map((day) => {
        const date = new Date(year, month - 1, day)
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const isBeforeCreation = dateStr < habitCreatedDate
        const isDue = !isBeforeCreation && isHabitDueOnDate(habit, date)
        const isToday = todayDay !== null && day === todayDay
        const completed = isToday
          ? completedHabitIdsToday.has(habit.id)
          : completedDateSet.has(dateStr)

        const isFuture = date > now
        const isPastOrToday = !isFuture
        
        const canToggle = isPastOrToday && isDue && (
          (isToday && onToggleToday !== undefined) ||
          (!isToday && onToggleDate !== undefined)
        )

        return (
          <td
            key={day}
            className={cn(
              'border-b border-stone-200 p-0.5 dark:border-stone-800',
              isToday && 'bg-green-100 dark:bg-green-950/50',
            )}
          >
            {isDue ? (
              canToggle ? (
                <button
                  type="button"
                  onClick={() => {
                    if (isToday && onToggleToday) {
                      onToggleToday(habit)
                    } else if (!isToday && onToggleDate) {
                      onToggleDate(habit, dateStr)
                    }
                  }}
                  aria-label={`${day}日: ${completed ? '完了' : '未完了'}`}
                  aria-pressed={completed}
                  className={cn(
                    'block h-4 w-4 rounded-sm focus:outline-none',
                    completed
                      ? 'bg-green-500 dark:bg-green-600'
                      : 'bg-stone-100 dark:bg-stone-800 hover:opacity-80',
                  )}
                  title={`${day}日${completed ? ' 完了 (クリックで切り替え)' : ' (クリックで完了)'}`}
                />
              ) : (
                <span
                  className={cn(
                    'block h-4 w-4 rounded-sm',
                    completed
                      ? 'bg-green-500 dark:bg-green-600'
                      : isFuture
                        ? 'bg-stone-50 dark:bg-stone-900/50 opacity-30'
                        : 'bg-stone-100 dark:bg-stone-800',
                  )}
                  title={`${day}日${completed ? ' 完了' : ''}${isToday ? ' (今日)' : ''}${isFuture ? ' (未来)' : ''}`}
                />
              )
            ) : (
              <span className="block h-4 w-4 rounded-sm bg-transparent" />
            )}
          </td>
        )
      })
      })()}
      <td className="w-14 shrink-0 border-b border-stone-200 px-2 py-3 text-right text-xs tabular-nums text-muted-foreground dark:border-stone-800">
        {rate !== null ? `${rate}%` : '−'}
      </td>
      <td className="w-12 shrink-0 border-b border-stone-200 p-1 dark:border-stone-800">
        <EditDeleteDropdownMenu
          onEdit={onEdit ? () => onEdit(habit) : undefined}
          onDelete={onDelete ? () => onDelete(habit) : undefined}
          triggerClassName="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        />
      </td>
    </tr>
  )
}
