'use client'

import { useGoals } from '@/features/goals'
import { useDevGoals } from '@/features/dev/goals'
import { LogGoalsSection } from '@/features/logs'
import { DevLogGoalsSection } from '@/features/dev/logs'
import { useUserSettings } from '@/features/settings'
import type { ReviewMode } from '../../types/review-completion'

interface YearEndGoalsStepProps {
  nextYear: Date
  mode: ReviewMode
}

export function YearEndGoalsStep({ nextYear, mode }: YearEndGoalsStepProps) {
  const { userSettings } = useUserSettings()
  const weekStartDay = userSettings?.weekStartDay ?? 1

  const { yearlyGoals } = useGoals(nextYear.getFullYear())
  const { yearlyGoals: devYearlyGoals } = useDevGoals(nextYear.getFullYear())

  if (mode === 'development') {
    return (
      <div className="space-y-5">
        <DevLogGoalsSection
          yearlyGoals={devYearlyGoals}
          monthlyGoals={[]}
          weeklyGoals={[]}
          currentDate={nextYear}
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
        currentDate={nextYear}
        weekStartDay={weekStartDay}
      />
    </div>
  )
}
