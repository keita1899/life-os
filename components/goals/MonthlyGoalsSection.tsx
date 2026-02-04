'use client'

import { useMemo } from 'react'
import { Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import type { MonthlyGoal } from '@/lib/types/monthly-goal'

interface MonthlyGoalsSectionProps {
  goals: MonthlyGoal[]
  selectedYear: number
  onCreateClick: () => void
  onEditClick: (goal: MonthlyGoal) => void
  onDeleteClick: (e: React.MouseEvent, goal: MonthlyGoal) => void
  onToggleAchievement?: (goal: MonthlyGoal) => void
}

function MonthlyGoalCard({
  goal,
  onEditClick,
  onDeleteClick,
  onToggleAchievement,
}: {
  goal: MonthlyGoal
  onEditClick: (goal: MonthlyGoal) => void
  onDeleteClick: (e: React.MouseEvent, goal: MonthlyGoal) => void
  onToggleAchievement?: (goal: MonthlyGoal) => void
}) {
  return (
    <Card className="group relative border-stone-200 dark:border-stone-800">
      <CardHeader className="pr-20">
        <div className="flex items-start gap-3">
          {onToggleAchievement && (
            <button
              type="button"
              onClick={() => onToggleAchievement(goal)}
              aria-label={goal.achieved ? '未達成にする' : '達成にする'}
              aria-pressed={goal.achieved}
              className="mt-0.5 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 focus:outline-none"
            >
              {goal.achieved ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-stone-400" />
              )}
            </button>
          )}
          <CardTitle
            className={cn(
              'text-stone-900 dark:text-stone-100 line-clamp-2 break-words flex-1',
              goal.achieved &&
                'line-through text-stone-500 dark:text-stone-400',
            )}
          >
            {goal.title}
          </CardTitle>
        </div>
      </CardHeader>
      <div className="absolute right-4 top-4 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEditClick(goal)}
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">編集</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => onDeleteClick(e, goal)}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">削除</span>
        </Button>
      </div>
    </Card>
  )
}

export const MonthlyGoalsSection = ({
  goals,
  selectedYear,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onToggleAchievement,
}: MonthlyGoalsSectionProps) => {
  const currentDate = useMemo(() => new Date(), [])
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const thisMonthGoals = useMemo(() => {
    if (selectedYear !== currentYear) return []
    return goals.filter((goal) => goal.month === currentMonth)
  }, [goals, selectedYear, currentYear, currentMonth])

  const monthlyGoalsByMonth = useMemo(() => {
    const monthly: Record<number, MonthlyGoal[]> = {}
    goals.forEach((goal) => {
      if (!monthly[goal.month]) monthly[goal.month] = []
      monthly[goal.month].push(goal)
    })
    return monthly
  }, [goals])

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-6 dark:border-stone-800 dark:bg-stone-950/30">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
          月間目標
        </h2>
        <Button variant="outline" onClick={onCreateClick} size="sm">
          月間目標を作成
        </Button>
      </div>

      {selectedYear === currentYear && (
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            今月の目標
          </h3>
          {thisMonthGoals.length === 0 ? (
            <EmptyState message="今月の目標はありません" />
          ) : (
            <div className="grid gap-4 grid-cols-1">
              {thisMonthGoals.map((goal) => (
                <MonthlyGoalCard
                  key={goal.id}
                  goal={goal}
                  onEditClick={onEditClick}
                  onDeleteClick={onDeleteClick}
                  onToggleAchievement={onToggleAchievement}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Accordion type="multiple" className="w-full" defaultValue={[]}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
          const monthGoals = monthlyGoalsByMonth[month] || []
          const isCurrentMonth =
            selectedYear === currentYear && month === currentMonth

          return (
            <AccordionItem
              key={month}
              value={`month-${month}`}
              className={
                isCurrentMonth ? 'border-stone-300 dark:border-stone-700' : ''
              }
            >
              <AccordionHeader>
                <AccordionTrigger
                  className={
                    isCurrentMonth ? 'text-blue-600 dark:text-blue-400' : ''
                  }
                >
                  {month}月
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                {monthGoals.length === 0 ? (
                  <EmptyState message="この月の目標はありません" />
                ) : (
                  <div className="grid gap-4 grid-cols-1">
                    {monthGoals.map((goal) => (
                      <MonthlyGoalCard
                        key={goal.id}
                        goal={goal}
                        onEditClick={onEditClick}
                        onDeleteClick={onDeleteClick}
                        onToggleAchievement={onToggleAchievement}
                      />
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
