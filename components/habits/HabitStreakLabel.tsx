'use client'

import { useMemo } from 'react'
import { useHabitCompletions } from '@/hooks/useHabitCompletions'
import { calcHabitStreak } from '@/lib/habits'
import type { Habit } from '@/lib/types/habit'

interface HabitStreakLabelProps {
  habit: Habit
  year: number
  month: number
}

export function HabitStreakLabel({
  habit,
  year,
  month,
}: HabitStreakLabelProps) {
  const thisMonth = useHabitCompletions(habit.id, year, month)
  const prevYear = month === 1 ? year - 1 : year
  const prevMonth = month === 1 ? 12 : month - 1
  const lastMonth = useHabitCompletions(habit.id, prevYear, prevMonth)

  const streak = useMemo(() => {
    const merged = [...(thisMonth.completions ?? []), ...(lastMonth.completions ?? [])]
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return calcHabitStreak(habit, merged, today)
  }, [habit, thisMonth.completions, lastMonth.completions])

  if (streak < 2) {
    return null
  }

  return (
    <span className="text-sm text-muted-foreground">
      {streak}日継続中
    </span>
  )
}
