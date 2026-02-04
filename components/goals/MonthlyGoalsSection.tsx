'use client'

import { useMemo } from 'react'
import { Pencil, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { MonthlyGoal } from '@/lib/types/monthly-goal'

interface MonthlyGoalsSectionProps {
  goals: MonthlyGoal[]
  selectedYear: number
  onCreateClick: () => void
  onEditClick: (goal: MonthlyGoal) => void
  onDeleteClick: (e: React.MouseEvent, goal: MonthlyGoal) => void
}

function MonthlyGoalCard({
  goal,
  onEditClick,
  onDeleteClick,
}: {
  goal: MonthlyGoal
  onEditClick: (goal: MonthlyGoal) => void
  onDeleteClick: (e: React.MouseEvent, goal: MonthlyGoal) => void
}) {
  return (
    <Card className="group relative border-stone-200 dark:border-stone-800">
      <CardHeader className="pr-20">
        <CardTitle className="text-stone-900 dark:text-stone-100 line-clamp-2 break-words">
          {goal.title}
        </CardTitle>
      </CardHeader>
      <div className="absolute right-4 top-4 flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">メニュー</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditClick(goal)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>編集</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => onDeleteClick(e, goal)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>削除</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
