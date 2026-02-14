'use client'

import { useMemo } from 'react'
import { CheckCircle2, Circle, Clock, Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isValidTimeFormat } from '@/lib/date/formats'
import {
  formatHabitScheduledTime,
  formatHabitFrequency,
  type Habit,
} from '@/features/habits'

interface HabitItemProps {
  habit: Habit
  completed: boolean
  onToggle?: (habit: Habit) => void
}

export function HabitItem({
  habit,
  completed,
  onToggle,
}: HabitItemProps) {
  const frequencyLabel = useMemo(
    () => formatHabitFrequency(habit),
    [habit],
  )

  const isValidScheduledTime = useMemo(
    () => isValidTimeFormat(habit.scheduledTime),
    [habit.scheduledTime],
  )

  const scheduledTimeStr = useMemo(
    () => formatHabitScheduledTime(habit.scheduledTime),
    [habit.scheduledTime],
  )

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border p-4',
        completed
          ? 'border-green-200/60 bg-green-50/50 dark:border-green-800/40 dark:bg-green-950/20'
          : 'border-green-200/60 bg-green-50/30 dark:border-green-800/40 dark:bg-green-950/10',
      )}
    >
      <div className="mt-0.5 flex min-w-[60px] items-center gap-1 text-sm font-medium">
        {isValidScheduledTime ? (
          <>
            <Clock className="h-4 w-4 shrink-0 text-green-700 dark:text-green-300" />
            <span className="text-green-700 dark:text-green-300">{scheduledTimeStr}</span>
          </>
        ) : (
          <div className="h-4 w-4 shrink-0" />
        )}
      </div>
      <div className="mt-0.5">
        <button
          type="button"
          onClick={() => onToggle?.(habit)}
          className="focus:outline-none"
        >
          {completed ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-green-500/40 dark:text-green-500/50" />
          )}
        </button>
      </div>
      <div className="flex-1">
        <div
          className={cn(
            'text-sm font-medium',
            completed
              ? 'text-green-600 line-through dark:text-green-400'
              : 'text-green-900 dark:text-green-100',
          )}
        >
          {habit.name}
        </div>
        {frequencyLabel && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Repeat className="h-3 w-3 shrink-0 text-green-600 dark:text-green-400" />
              {frequencyLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
