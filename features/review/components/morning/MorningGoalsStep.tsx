'use client'

import { useMemo } from 'react'
import { useGoals } from '@/features/goals'
import { useDevGoals } from '@/features/dev/goals'
import {
  getYearlyGoalsForDate,
  getMonthlyGoalsForDate,
  getWeeklyGoalsForDate,
} from '@/features/logs'
import {
  getDevYearlyGoalsForDate,
  getDevMonthlyGoalsForDate,
  getDevWeeklyGoalsForDate,
} from '@/features/dev/logs'
import { LogGoalsSection } from '@/features/logs'
import { DevLogGoalsSection } from '@/features/dev/logs'
import { useUserSettings } from '@/features/settings'
import type { ReviewMode } from '../../types/review-completion'
import { getYear } from 'date-fns'

interface MorningGoalsStepProps {
  today: Date
  mode: ReviewMode
}

export function MorningGoalsStep({ today, mode }: MorningGoalsStepProps) {
  const year = getYear(today)
  const { userSettings } = useUserSettings()
  const weekStartDay = userSettings?.weekStartDay ?? 1

  const { yearlyGoals, monthlyGoals, weeklyGoals } = useGoals(year)
  const {
    yearlyGoals: devYearlyGoals,
    monthlyGoals: devMonthlyGoals,
    weeklyGoals: devWeeklyGoals,
  } = useDevGoals(year)

  const lifeYearly = useMemo(
    () => getYearlyGoalsForDate(yearlyGoals, today),
    [yearlyGoals, today],
  )
  const lifeMonthly = useMemo(
    () => getMonthlyGoalsForDate(monthlyGoals, today),
    [monthlyGoals, today],
  )
  const lifeWeekly = useMemo(
    () => getWeeklyGoalsForDate(weeklyGoals, today),
    [weeklyGoals, today],
  )

  const devYearly = useMemo(
    () => getDevYearlyGoalsForDate(devYearlyGoals, today),
    [devYearlyGoals, today],
  )
  const devMonthly = useMemo(
    () => getDevMonthlyGoalsForDate(devMonthlyGoals, today),
    [devMonthlyGoals, today],
  )
  const devWeekly = useMemo(
    () =>
      getDevWeeklyGoalsForDate(devWeeklyGoals, today, weekStartDay),
    [devWeeklyGoals, today, weekStartDay],
  )

  if (mode === 'development') {
    return (
      <div className="space-y-5">
        <DevLogGoalsSection
          yearlyGoals={devYearly}
          monthlyGoals={devMonthly}
          weeklyGoals={devWeekly}
          currentDate={today}
          weekStartDay={weekStartDay}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <LogGoalsSection
        yearlyGoals={lifeYearly}
        monthlyGoals={lifeMonthly}
        weeklyGoals={lifeWeekly}
        currentDate={today}
        weekStartDay={weekStartDay}
      />
    </div>
  )
}
