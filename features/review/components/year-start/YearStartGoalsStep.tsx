'use client'

import { useGoals } from '@/features/goals'
import { useDevGoals } from '@/features/dev/goals'
import { LogGoalsSection } from '@/features/logs'
import { DevLogGoalsSection } from '@/features/dev/logs'
import { useUserSettings } from '@/features/settings'
import type { ReviewMode } from '../../types/review-completion'

interface YearStartGoalsStepProps {
  currentYear: Date
  mode: ReviewMode
}

export function YearStartGoalsStep({
  currentYear,
  mode,
}: YearStartGoalsStepProps) {
  const year = currentYear.getFullYear()
  const { userSettings } = useUserSettings()
  const weekStartDay = userSettings?.weekStartDay ?? 1

  const { yearlyGoals } = useGoals(year)
  const { yearlyGoals: devYearlyGoals } = useDevGoals(year)

  if (mode === 'development') {
    return (
      <div className="space-y-5">
        <DevLogGoalsSection
          yearlyGoals={devYearlyGoals}
          monthlyGoals={[]}
          weeklyGoals={[]}
          currentDate={currentYear}
          weekStartDay={weekStartDay}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <LogGoalsSection
        yearlyGoals={yearlyGoals}
        monthlyGoals={[]}
        weeklyGoals={[]}
        currentDate={currentYear}
        weekStartDay={weekStartDay}
      />
    </div>
  )
}
