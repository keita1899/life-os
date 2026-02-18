'use client'

import { useMemo } from 'react'
import { format, addDays } from 'date-fns'
import useSWR from 'swr'
import { getWeeklyGoalByWeekStart } from '@/features/goals'
import { getDevWeeklyGoalByWeekStart } from '@/features/dev/goals'
import { EmptyState } from '@/components/ui/empty-state'
import type { ReviewMode } from '../../types/review-completion'

interface WeekEndNextGoalsStepProps {
  weekStartDate: Date
  mode: ReviewMode
}

function getNextWeekStartDateStr(weekStartDate: Date): string {
  const next = addDays(weekStartDate, 7)
  return format(next, 'yyyy-MM-dd')
}

export function WeekEndNextGoalsStep({
  weekStartDate,
  mode,
}: WeekEndNextGoalsStepProps) {
  const nextWeekStartStr = useMemo(
    () => getNextWeekStartDateStr(weekStartDate),
    [weekStartDate],
  )

  const fetcher =
    mode === 'life'
      ? () => getWeeklyGoalByWeekStart(nextWeekStartStr)
      : () => getDevWeeklyGoalByWeekStart(nextWeekStartStr)

  const key = ['weekly-goal-next', mode, nextWeekStartStr]
  const { data: goal, isLoading } = useSWR(key, fetcher)

  if (isLoading) return null

  if (!goal) {
    return (
      <div className="space-y-5">
        <EmptyState message="来週の目標を立てましょう" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">来週の目標です</p>
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
        <p className="text-lg font-bold text-zinc-200">{goal.title}</p>
      </div>
    </div>
  )
}
