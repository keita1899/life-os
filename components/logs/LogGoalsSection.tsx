'use client'

import { Flag, Map, Zap } from 'lucide-react'
import { getYear, getMonth } from 'date-fns'
import type { YearlyGoal } from '@/lib/types/yearly-goal'
import type { MonthlyGoal } from '@/lib/types/monthly-goal'
import type { WeeklyGoal } from '@/lib/types/weekly-goal'

interface LogGoalsSectionProps {
  yearlyGoals: YearlyGoal[]
  monthlyGoals: MonthlyGoal[]
  weeklyGoals: WeeklyGoal[]
  currentDate: Date
}

export function LogGoalsSection({
  yearlyGoals,
  monthlyGoals,
  weeklyGoals,
  currentDate,
}: LogGoalsSectionProps) {
  const hasAnyGoals =
    yearlyGoals.length > 0 ||
    monthlyGoals.length > 0 ||
    weeklyGoals.length > 0

  if (!hasAnyGoals) {
    return null
  }

  const year = getYear(currentDate)
  const month = getMonth(currentDate)
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const monthName = monthNames[month]

  const yearlyGoalTitles = yearlyGoals
    .filter((g) => !g.achieved)
    .map((g) => g.title)
    .join(', ')

  const monthlyGoalTitles = monthlyGoals
    .filter((g) => !g.achieved)
    .map((g) => g.title)
    .join(', ')

  const weeklyGoalsFiltered = weeklyGoals.filter((g) => !g.achieved)

  const hasYearlyOrMonthly = yearlyGoals.length > 0 || monthlyGoals.length > 0
  const hasWeekly = weeklyGoals.length > 0

  return (
    <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-950/50 flex flex-col gap-6">
      {hasYearlyOrMonthly && (
        <div className="space-y-4">
          {yearlyGoals.length > 0 && (
            <div className="flex items-center justify-between text-zinc-500">
              <div className="flex items-center gap-2">
                <Flag className="w-3 h-3" />
                <span className="text-xs font-mono">{year}年の目標</span>
              </div>
              <span className="text-xs">{yearlyGoalTitles || 'なし'}</span>
            </div>
          )}

          {monthlyGoals.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-zinc-400">
                <Map className="w-3 h-3" />
                <span className="text-xs font-mono">{monthName}の目標</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
                {monthlyGoalTitles || 'なし'}
              </p>
            </div>
          )}
        </div>
      )}

      {hasWeekly && (
        <>
          {hasYearlyOrMonthly && <div className="h-px bg-zinc-800/50" />}

          <div className="relative">
            <div className="flex items-center gap-2 mb-2 text-purple-500">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-mono font-bold tracking-wider">
                今週の目標
              </span>
            </div>

            <div className="space-y-2">
              {weeklyGoalsFiltered.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 rounded-lg bg-purple-50 border border-purple-200 dark:bg-purple-950/50 dark:border-purple-800"
                >
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{goal.title}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
