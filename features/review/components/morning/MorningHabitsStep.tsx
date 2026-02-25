'use client'

import { useMemo } from 'react'
import { useHabits } from '@/features/habits'
import { isHabitDueOnDate } from '@/features/habits'
import { formatHabitScheduledTime } from '@/features/habits'
import { EmptyState } from '@/components/ui/empty-state'

interface MorningHabitsStepProps {
  today: Date
}

export function MorningHabitsStep({ today }: MorningHabitsStepProps) {
  const { habits: allHabits } = useHabits()

  const habitsForToday = useMemo(
    () =>
      allHabits
        .filter((h) => isHabitDueOnDate(h, today))
        .sort((a, b) => {
          if (!a.scheduledTime && !b.scheduledTime) return 0
          if (!a.scheduledTime) return 1
          if (!b.scheduledTime) return -1
          return a.scheduledTime.localeCompare(b.scheduledTime)
        }),
    [allHabits, today],
  )

  if (habitsForToday.length === 0) {
    return (
      <div className="space-y-5">
        <EmptyState message="今日の習慣はありません" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <ul className="space-y-2">
        {habitsForToday.map((habit) => (
          <li
            key={habit.id}
            className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
          >
            <span className="font-medium">{habit.name}</span>
            <span className="text-sm text-muted-foreground">
              {formatHabitScheduledTime(habit.scheduledTime) || '−'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
