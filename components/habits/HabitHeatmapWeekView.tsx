'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
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

export interface HabitHeatmapWeekViewProps {
  habits: Habit[]
  weekDates: Date[]
  weekDateStrings: string[]
  primaryYear: number
  primaryMonth: number
  secondaryYear: number
  secondaryMonth: number
  completedHabitIdsToday: Set<number>
  onToggleToday?: (habit: Habit) => void
  onToggleDate?: (habit: Habit, dateStr: string) => void
  onEdit?: (habit: Habit) => void
  onDelete?: (habit: Habit) => void
}

export function HabitHeatmapWeekView({
  habits,
  weekDates,
  weekDateStrings,
  primaryYear,
  primaryMonth,
  secondaryYear,
  secondaryMonth,
  completedHabitIdsToday,
  onToggleToday,
  onToggleDate,
  onEdit,
  onDelete,
}: HabitHeatmapWeekViewProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const gridCols =
    'grid-cols-[5rem_1fr_4.5rem_4.5rem_4.5rem_4.5rem_4.5rem_4.5rem_4.5rem_4rem_3rem]'

  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-800">
      <div className={cn('grid gap-0', gridCols)}>
        <div className="border-b border-stone-200 bg-stone-50 px-3 py-3 text-right text-xs font-medium text-muted-foreground dark:border-stone-800 dark:bg-stone-950">
          時間
        </div>
        <div className="border-b border-stone-200 bg-stone-50 px-3 py-3 text-xs font-medium text-muted-foreground dark:border-stone-800 dark:bg-stone-950">
          習慣
        </div>
        {weekDates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const isToday = dateStr === todayStr
          return (
            <div
              key={dateStr}
              className={cn(
                'flex flex-col border-b border-stone-200 bg-stone-50 px-2 py-3 text-center dark:border-stone-800 dark:bg-stone-950',
                isToday && 'bg-green-100 dark:bg-green-950/50',
              )}
            >
              <span className="text-sm font-medium text-foreground">
                {format(date, 'EEE', { locale: ja })}
              </span>
              <span className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                {format(date, 'M/d')}
              </span>
            </div>
          )
        })}
        <div className="border-b border-stone-200 bg-stone-50 px-3 py-3 text-right text-xs font-medium text-muted-foreground dark:border-stone-800 dark:bg-stone-950">
          達成率
        </div>
        <div className="border-b border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-950" />
      </div>
      {habits.map((habit) => (
        <HabitHeatmapWeekViewRow
          key={habit.id}
          habit={habit}
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
      ))}
    </div>
  )
}

interface HabitHeatmapWeekViewRowProps {
  habit: Habit
  weekDates: Date[]
  weekDateStrings: string[]
  primaryYear: number
  primaryMonth: number
  secondaryYear: number
  secondaryMonth: number
  completedHabitIdsToday: Set<number>
  onToggleToday?: (habit: Habit) => void
  onToggleDate?: (habit: Habit, dateStr: string) => void
  onEdit?: (habit: Habit) => void
  onDelete?: (habit: Habit) => void
}

function HabitHeatmapWeekViewRow(props: HabitHeatmapWeekViewRowProps) {
  const {
    habit,
    weekDates,
    weekDateStrings,
    primaryYear,
    primaryMonth,
    secondaryYear,
    secondaryMonth,
    completedHabitIdsToday,
    onToggleToday,
    onToggleDate,
    onEdit,
    onDelete,
  } = props
  const { completions: primaryCompletions, isLoading: primaryLoading } =
    useHabitCompletions(habit.id, primaryYear, primaryMonth)
  const { completions: secondaryCompletions, isLoading: secondaryLoading } =
    useHabitCompletions(habit.id, secondaryYear, secondaryMonth)

  const completedDateSet = new Set([
    ...primaryCompletions.map((c) => c.completedDate),
    ...secondaryCompletions.map((c) => c.completedDate),
  ])
  const isLoading = primaryLoading || secondaryLoading
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  if (isLoading) {
    return (
      <div className="grid grid-cols-[5rem_1fr_4.5rem_4.5rem_4.5rem_4.5rem_4.5rem_4.5rem_4.5rem_4rem_3rem] gap-0">
        <div className="border-b border-stone-200 px-3 py-3 dark:border-stone-800" />
        <div className="col-span-9 border-b border-stone-200 px-3 py-3 text-sm text-muted-foreground dark:border-stone-800">
          {habit.name} 読み込み中...
        </div>
      </div>
    )
  }

  let dueCount = 0
  let completedCount = 0
  weekDates.forEach((date, i) => {
    if (isHabitDueOnDate(habit, date)) {
      dueCount++
      if (completedDateSet.has(weekDateStrings[i] ?? '')) completedCount++
    }
  })
  const rate =
    dueCount > 0 ? Math.round((completedCount / dueCount) * 100) : null

  return (
    <div className="group grid grid-cols-[5rem_1fr_4.5rem_4.5rem_4.5rem_4.5rem_4.5rem_4.5rem_4.5rem_4rem_3rem] gap-0">
      <div className="border-b border-stone-200 px-3 py-3 text-right text-sm tabular-nums text-muted-foreground dark:border-stone-800">
        {formatHabitScheduledTime(habit.scheduledTime) || '−'}
      </div>
      <div className="border-b border-stone-200 px-3 py-3 text-sm font-medium dark:border-stone-800">
        {habit.name}
      </div>
      {weekDates.map((date, i) => {
        const dateStr = weekDateStrings[i] ?? ''
        const isDue = isHabitDueOnDate(habit, date)
        const isToday = dateStr === todayStr
        const completed = isToday
          ? completedHabitIdsToday.has(habit.id)
          : completedDateSet.has(dateStr)
        
        const now = new Date()
        const isFuture = date > now
        const isPastOrToday = !isFuture
        
        const canToggle = isPastOrToday && isDue && (
          (isToday && onToggleToday !== undefined) ||
          (!isToday && onToggleDate !== undefined)
        )

        return (
          <div
            key={dateStr}
            className={cn(
              'flex min-h-[4rem] items-center justify-center border-b border-stone-200 p-2 dark:border-stone-800',
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
                  className={cn(
                    'block h-4 w-4 rounded-sm focus:outline-none',
                    completed
                      ? 'bg-green-500 dark:bg-green-600'
                      : 'bg-stone-100 dark:bg-stone-800 hover:opacity-80',
                  )}
                  title={`${format(date, 'M/d')}${completed ? ' 完了 (クリックで切り替え)' : ' (クリックで完了)'}`}
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
                  title={`${format(date, 'M/d')}${completed ? ' 完了' : ''}${isToday ? ' (今日)' : ''}${isFuture ? ' (未来)' : ''}`}
                />
              )
            ) : (
              <span className="block h-4 w-4 rounded-sm bg-transparent" />
            )}
          </div>
        )
      })}
      <div className="flex items-center justify-end border-b border-stone-200 px-3 py-3 text-sm tabular-nums text-muted-foreground dark:border-stone-800">
        {rate !== null ? `${rate}%` : '−'}
      </div>
      <div className="flex items-center border-b border-stone-200 p-2 dark:border-stone-800">
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
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
      </div>
    </div>
  )
}
