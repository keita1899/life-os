'use client'

import { getYear, getMonth, startOfWeek, endOfWeek, format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import type { YearlyGoal, MonthlyGoal, WeeklyGoal } from '@/features/goals'

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

interface LogGoalsSectionProps {
  yearlyGoals: YearlyGoal[]
  monthlyGoals: MonthlyGoal[]
  weeklyGoals: WeeklyGoal[]
  currentDate: Date
  weekStartDay?: number
}

export function LogGoalsSection({
  yearlyGoals,
  monthlyGoals,
  weeklyGoals,
  currentDate,
  weekStartDay = 1,
}: LogGoalsSectionProps) {
  const yearlyGoalTitles = yearlyGoals
    .filter((g) => !g.achieved)
    .map((g) => g.title)
    .join(', ')

  const monthlyGoalTitles = monthlyGoals
    .filter((g) => !g.achieved)
    .map((g) => g.title)
    .join(', ')

  const weeklyGoalsFiltered = weeklyGoals.filter((g) => !g.achieved)

  const hasYearly = yearlyGoalTitles.length > 0
  const hasMonthly = monthlyGoalTitles.length > 0
  const hasWeekly = weeklyGoalsFiltered.length > 0

  if (!hasYearly && !hasMonthly && !hasWeekly) {
    return <EmptyState message="目標がありません" />
  }

  const year = getYear(currentDate)
  const monthName = MONTH_NAMES[getMonth(currentDate)]
  const weekStartsOn = (weekStartDay === 0 ? 0 : 1) as 0 | 1
  const weekStart = startOfWeek(currentDate, { weekStartsOn })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn })
  const weekRangeLabel = `${format(weekStart, 'M/d')} ~ ${format(weekEnd, 'M/d')}`

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
      {hasYearly && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="shrink-0">
              年間
            </Badge>
            <h3 className="text-sm font-medium text-zinc-400">{year}年</h3>
          </div>
          <div className="text-sm text-zinc-200">{yearlyGoalTitles}</div>
        </section>
      )}

      {hasMonthly && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="shrink-0">
              月間
            </Badge>
            <h3 className="text-sm font-medium text-zinc-400">{monthName}</h3>
          </div>
          <div className="text-sm leading-relaxed text-zinc-200">
            {monthlyGoalTitles}
          </div>
        </section>
      )}

      {hasWeekly && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="shrink-0">
              週間
            </Badge>
            <h3 className="text-sm font-medium text-zinc-400">{weekRangeLabel}</h3>
          </div>
          <div className="space-y-2">
            {weeklyGoalsFiltered.map((goal) => (
              <div
                key={goal.id}
                className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/50"
              >
                <p className="text-lg font-bold text-purple-900 dark:text-zinc-200">
                  {goal.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
