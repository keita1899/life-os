'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { useHabits } from '@/features/habits'
import { useHabitCompletionsByDate } from '@/features/habits'
import { isHabitDueOnDate } from '@/features/habits'
import { LogHabitsSection } from '@/features/logs'
import { EmptyState } from '@/components/ui/empty-state'

interface EveningHabitsStepProps {
  today: Date
  execute: <T>(
    fn: () => Promise<T>,
    errorMessage: string,
  ) => Promise<T | undefined>
}

export function EveningHabitsStep({ today, execute }: EveningHabitsStepProps) {
  const dateStr = format(today, 'yyyy-MM-dd')
  const { habits: allHabits } = useHabits()
  const {
    completions,
    createCompletion,
    deleteCompletion,
  } = useHabitCompletionsByDate(dateStr)

  const habitsForToday = useMemo(
    () => allHabits.filter((h) => isHabitDueOnDate(h, today)),
    [allHabits, today],
  )

  const completedHabitIds = useMemo(
    () => new Set(completions.map((c) => c.habitId)),
    [completions],
  )

  const handleToggle = async (habit: { id: number }) => {
    const completed = completedHabitIds.has(habit.id)
    await execute(
      async () => {
        if (completed) {
          await deleteCompletion(habit.id, dateStr)
        } else {
          await createCompletion(habit.id, dateStr)
        }
      },
      '習慣の完了状態の更新に失敗しました',
    )
  }

  if (habitsForToday.length === 0) {
    return (
      <div className="space-y-5">
        <EmptyState message="今日の習慣はありません" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <LogHabitsSection
        habits={habitsForToday}
        completedHabitIds={completedHabitIds}
        onToggle={handleToggle}
      />
    </div>
  )
}
