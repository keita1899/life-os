'use client'

import { useMemo } from 'react'
import { useGoals } from '@/features/goals'
import { useDevGoals } from '@/features/dev/goals'
import { getMonthlyGoalsForDate } from '@/features/calendar'
import { LogGoalsSection } from '@/features/logs'
import { DevLogGoalsSection } from '@/features/dev/logs'
import { useUserSettings } from '@/features/settings'
import type { ReviewMode } from '../../types/review-completion'

interface MonthStartGoalsStepProps {
  currentMonth: Date
  mode: ReviewMode
}

export function MonthStartGoalsStep({
  currentMonth,
  mode,
}: MonthStartGoalsStepProps) {
  const year = currentMonth.getFullYear()
  const { userSettings } = useUserSettings()
  const weekStartDay = userSettings?.weekStartDay ?? 1

  const { monthlyGoals } = useGoals(year)
  const { monthlyGoals: devMonthlyGoals } = useDevGoals(year)

  const lifeMonthly = useMemo(
    () => getMonthlyGoalsForDate(monthlyGoals, currentMonth),
    [monthlyGoals, currentMonth],
  )
  const devMonthly = useMemo(
    () =>
      devMonthlyGoals.filter(
        (g) =>
          g.year === year && g.month === currentMonth.getMonth() + 1,
      ),
    [devMonthlyGoals, currentMonth, year],
  )

  if (mode === 'development') {
    return (
      <div className="space-y-5">
        <DevLogGoalsSection
          yearlyGoals={[]}
          monthlyGoals={devMonthly}
          weeklyGoals={[]}
          currentDate={currentMonth}
          weekStartDay={weekStartDay}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <LogGoalsSection
        yearlyGoals={[]}
        monthlyGoals={lifeMonthly}
        weeklyGoals={[]}
        currentDate={currentMonth}
        weekStartDay={weekStartDay}
      />
    </div>
  )
}
