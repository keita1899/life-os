'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { YearlyGoal } from '@/lib/types/yearly-goal'
import type { MonthlyGoal } from '@/lib/types/monthly-goal'
import type { WeeklyGoal } from '@/lib/types/weekly-goal'

interface LogGoalsSectionProps {
  yearlyGoals: YearlyGoal[]
  monthlyGoals: MonthlyGoal[]
  weeklyGoals: WeeklyGoal[]
}

export function LogGoalsSection({
  yearlyGoals,
  monthlyGoals,
  weeklyGoals,
}: LogGoalsSectionProps) {
  const hasAnyGoals =
    yearlyGoals.length > 0 ||
    monthlyGoals.length > 0 ||
    weeklyGoals.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">目標</CardTitle>
      </CardHeader>
      <CardContent>
        {hasAnyGoals ? (
          <div className="space-y-6">
            {yearlyGoals.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  年間目標
                </h3>
                <ul className="space-y-2">
                  {yearlyGoals.map((goal) => (
                    <li
                      key={goal.id}
                      className={cn(
                        'text-sm',
                        goal.achieved &&
                          'line-through text-stone-500 dark:text-stone-400',
                      )}
                    >
                      {goal.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {monthlyGoals.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  月間目標
                </h3>
                <ul className="space-y-2">
                  {monthlyGoals.map((goal) => (
                    <li
                      key={goal.id}
                      className={cn(
                        'text-sm',
                        goal.achieved &&
                          'line-through text-stone-500 dark:text-stone-400',
                      )}
                    >
                      {goal.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {weeklyGoals.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  週間目標
                </h3>
                <ul className="space-y-2">
                  {weeklyGoals.map((goal) => (
                    <li
                      key={goal.id}
                      className={cn(
                        'text-sm',
                        goal.achieved &&
                          'line-through text-stone-500 dark:text-stone-400',
                      )}
                    >
                      {goal.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            目標がありません
          </p>
        )}
      </CardContent>
    </Card>
  )
}
