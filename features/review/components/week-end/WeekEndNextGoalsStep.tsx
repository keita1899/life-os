'use client'

import { useMemo } from 'react'
import { addDays } from 'date-fns'
import { useGoals, WeeklyGoalForm } from '@/features/goals'
import { useDevGoals, WeeklyGoalForm as DevWeeklyGoalForm } from '@/features/dev/goals'
import { getWeekStartDate } from '@/features/calendar'
import { useUserSettings } from '@/features/settings'
import type { ReviewMode } from '../../types/review-completion'

interface WeekEndNextGoalsStepProps {
  weekStartDate: Date
  mode: ReviewMode
}

export function WeekEndNextGoalsStep({
  weekStartDate,
  mode,
}: WeekEndNextGoalsStepProps) {
  const { userSettings } = useUserSettings()
  const weekStartDay = userSettings?.weekStartDay ?? 1

  const nextWeekStartDate = useMemo(
    () => addDays(weekStartDate, 7),
    [weekStartDate],
  )

  const nextWeekYear = nextWeekStartDate.getFullYear()

  const { weeklyGoals } = useGoals(nextWeekYear)
  const { weeklyGoals: devWeeklyGoals } = useDevGoals(nextWeekYear)

  if (mode === 'development') {
    return (
      <div className="space-y-5">
        <DevWeeklyGoalForm
          currentDate={nextWeekStartDate}
          weeklyGoals={devWeeklyGoals}
          weekStartDay={weekStartDay}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <WeeklyGoalForm
        currentDate={nextWeekStartDate}
        weeklyGoals={weeklyGoals}
        weekStartDay={weekStartDay}
      />
    </div>
  )
}
