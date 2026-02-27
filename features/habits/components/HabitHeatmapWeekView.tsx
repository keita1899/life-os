'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { useSWRConfig } from 'swr'
import { useHabitCompletionsByDateRange } from '../hooks/useHabitCompletions'
import { isHabitDueOnDate, formatHabitScheduledTime } from '../lib'
import type { Habit } from '../types/habit'
import { cn } from '@/lib/utils'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import { SWR_KEYS } from '@/lib/swr-keys'

export interface HabitHeatmapWeekViewProps {
  habits: Habit[]
  weekDates: Date[]
  weekDateStrings: string[]
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
    <div>
      <div className={cn('grid gap-0', gridCols)}>
        <div className="flex items-center justify-end border-b border-stone-200 bg-stone-50 px-3 py-3 text-xs font-medium text-muted-foreground dark:border-stone-800 dark:bg-stone-950">
          時間
        </div>
        <div className="flex items-center border-b border-stone-200 bg-stone-50 px-3 py-3 text-xs font-medium text-muted-foreground dark:border-stone-800 dark:bg-stone-950">
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
        <div className="flex items-center justify-end border-b border-stone-200 bg-stone-50 px-3 py-3 text-xs font-medium text-muted-foreground dark:border-stone-800 dark:bg-stone-950">
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
    completedHabitIdsToday,
    onToggleToday,
    onToggleDate,
    onEdit,
    onDelete,
  } = props
  const { mutate } = useSWRConfig()
  const weekStartStr = weekDateStrings[0] ?? ''
  const weekEndStr = weekDateStrings[6] ?? ''
  const { completions, isLoading } = useHabitCompletionsByDateRange(
    habit.id,
    weekStartStr,
    weekEndStr,
  )

  const completedDateSet = new Set(completions.map((c) => c.completedDate))
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const habitCreatedDate = habit.createdAt.slice(0, 10)
  const habitCreatedYearMonth = habit.createdAt.slice(0, 7)
  const isNewThisMonth = weekDateStrings.some(
    (ds) => ds.slice(0, 7) === habitCreatedYearMonth,
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-[5rem_1fr_4.5rem_4.5rem_4.5rem_4.5rem_4.5rem_4.5rem_4.5rem_4rem_3rem] gap-0">
        <div className="flex items-center border-b border-stone-200 px-3 py-3 dark:border-stone-800" />
        <div className="col-span-9 flex items-center border-b border-stone-200 px-3 py-3 text-sm text-muted-foreground dark:border-stone-800">
          {habit.name} 読み込み中...
        </div>
      </div>
    )
  }

  let dueCount = 0
  let completedCount = 0
  weekDates.forEach((date, i) => {
    const dateStr = weekDateStrings[i] ?? ''
    if (dateStr < habitCreatedDate) return
    if (isHabitDueOnDate(habit, date)) {
      dueCount++
      if (completedDateSet.has(dateStr)) completedCount++
    }
  })
  const rate =
    dueCount > 0 ? Math.round((completedCount / dueCount) * 100) : null

  return (
    <div className={cn(
      'group grid grid-cols-[5rem_1fr_4.5rem_4.5rem_4.5rem_4.5rem_4.5rem_4.5rem_4.5rem_4rem_3rem] gap-0',
      isNewThisMonth && 'bg-amber-50/60 dark:bg-amber-950/20',
    )}>
      <div className="flex items-center justify-end border-b border-stone-200 px-3 py-3 text-sm tabular-nums text-muted-foreground dark:border-stone-800">
        {formatHabitScheduledTime(habit.scheduledTime) || '−'}
      </div>
      <div className="flex items-center gap-1.5 border-b border-stone-200 px-3 py-3 text-sm font-medium dark:border-stone-800">
        {habit.name}
        {isNewThisMonth && (
          <span className="inline-flex shrink-0 rounded-full bg-amber-200 px-1.5 py-0.5 text-[10px] font-medium leading-none text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            NEW
          </span>
        )}
      </div>
      {(() => {
        const now = new Date()
        return weekDates.map((date, i) => {
        const dateStr = weekDateStrings[i] ?? ''
        const isBeforeCreation = dateStr < habitCreatedDate
        const isDue = !isBeforeCreation && isHabitDueOnDate(habit, date)
        const isToday = dateStr === todayStr
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
                  onClick={async () => {
                    if (isToday && onToggleToday) {
                      await onToggleToday(habit)
                    } else if (!isToday && onToggleDate) {
                      await onToggleDate(habit, dateStr)
                    }
                    mutate(
                      SWR_KEYS.habitCompletionsByDateRange(
                        habit.id,
                        weekStartStr,
                        weekEndStr,
                      ),
                    )
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
      })
      })()}
      <div className="flex items-center justify-end border-b border-stone-200 px-3 py-3 text-sm tabular-nums text-muted-foreground dark:border-stone-800">
        {rate !== null ? `${rate}%` : '−'}
      </div>
      <div className="flex items-center border-b border-stone-200 p-2 dark:border-stone-800">
        <EditDeleteDropdownMenu
          onEdit={onEdit ? () => onEdit(habit) : undefined}
          onDelete={onDelete ? () => onDelete(habit) : undefined}
          triggerClassName="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        />
      </div>
    </div>
  )
}
