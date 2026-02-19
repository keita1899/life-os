'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { useGoals } from '@/features/goals'
import { useDevGoals } from '@/features/dev/goals'
import { getDevWeeklyGoalsForDate } from '@/features/dev/logs'
import { LogGoalsSection } from '@/features/logs'
import { DevLogGoalsSection } from '@/features/dev/logs'
import { useUserSettings } from '@/features/settings'
import type { ReviewMode } from '../../types/review-completion'

interface WeekStartGoalsStepProps {
  weekStartDate: Date
  mode: ReviewMode
}

export function WeekStartGoalsStep({
  weekStartDate,
  mode,
}: WeekStartGoalsStepProps) {
  const year = weekStartDate.getFullYear()
  const { userSettings } = useUserSettings()
  const weekStartDay = userSettings?.weekStartDay ?? 1
  const weekStartDateStr = format(weekStartDate, 'yyyy-MM-dd')

  const { weeklyGoals } = useGoals(year)
  const { weeklyGoals: devWeeklyGoals } = useDevGoals(year)

  const lifeWeekly = useMemo(
    () =>
      weeklyGoals.filter((g) => g.weekStartDate === weekStartDateStr),
    [weeklyGoals, weekStartDateStr],
  )
  const devWeekly = useMemo(
    () =>
      getDevWeeklyGoalsForDate(devWeeklyGoals, weekStartDate, weekStartDay),
    [devWeeklyGoals, weekStartDate, weekStartDay],
  )

  if (mode === 'development') {
    return (
      <div className="space-y-5">
        <DevLogGoalsSection
          yearlyGoals={[]}
          monthlyGoals={[]}
          weeklyGoals={devWeekly}
          currentDate={weekStartDate}
          weekStartDay={weekStartDay}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <LogGoalsSection
        yearlyGoals={[]}
        monthlyGoals={[]}
        weeklyGoals={lifeWeekly}
        currentDate={weekStartDate}
        weekStartDay={weekStartDay}
      />
    </div>
  )
}
