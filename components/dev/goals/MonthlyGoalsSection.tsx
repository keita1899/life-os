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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { DevMonthlyGoal } from '@/lib/types/dev-monthly-goal'

interface MonthlyGoalsSectionProps {
  goals: DevMonthlyGoal[]
  selectedYear: number
  onCreateClick: () => void
  onEditClick: (goal: DevMonthlyGoal) => void
  onDeleteClick: (e: React.MouseEvent, goal: DevMonthlyGoal) => void
}

export const MonthlyGoalsSection = ({
  goals,
  selectedYear,
  onCreateClick,
  onEditClick,
  onDeleteClick,
}: MonthlyGoalsSectionProps) => {
  const monthlyGoalsByMonth = useMemo(() => {
    const monthly: Record<number, DevMonthlyGoal[]> = {}

    goals.forEach((goal) => {
      if (!monthly[goal.month]) {
        monthly[goal.month] = []
      }
      monthly[goal.month].push(goal)
    })

    return monthly
  }, [goals])

  const defaultOpenMonth = useMemo(() => {
    const currentDate = new Date()
    const isCurrentYear = selectedYear === currentDate.getFullYear()
    if (isCurrentYear) {
      return [`month-${currentDate.getMonth() + 1}`]
    }
    return []
  }, [selectedYear])

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
      <Accordion
        type="multiple"
        className="w-full"
        defaultValue={defaultOpenMonth}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
          const monthGoals = monthlyGoalsByMonth[month] || []
          const currentDate = new Date()
          const isCurrentMonth =
            selectedYear === currentDate.getFullYear() &&
            month === currentDate.getMonth() + 1

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
                      <Card
                        key={goal.id}
                        className="group relative border-stone-200 dark:border-stone-800"
                      >
                        <CardHeader className="pr-20">
                          <CardTitle className="text-stone-900 dark:text-stone-100 line-clamp-2 break-words">
                            {goal.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                          </div>
                        </CardContent>
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
