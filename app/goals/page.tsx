'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { X, Pencil } from 'lucide-react'
import { useGoals } from '@/hooks/useGoals'
import { GoalDialog } from '@/components/goals/GoalDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CreateGoalInput, Goal, UpdateGoalInput } from '@/lib/types/goal'

const GoalsPage = () => {
  const { goals, isLoading, error, createGoal, updateGoal } = useGoals()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [createError, setCreateError] = useState<string | null>(null)
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined)

  const handleCreateGoal = async (input: CreateGoalInput) => {
    try {
      setCreateError(null)
      await createGoal(input)
      setIsDialogOpen(false)
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : '目標の作成に失敗しました',
      )
    }
  }

  const handleUpdateGoal = async (input: CreateGoalInput) => {
    if (!editingGoal) return
    try {
      setCreateError(null)
      const updateInput: UpdateGoalInput = {
        title: input.title,
        targetDate: input.targetDate || null,
        periodType: input.periodType,
      }
      await updateGoal(editingGoal.id, updateInput)
      setIsDialogOpen(false)
      setEditingGoal(undefined)
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : '目標の更新に失敗しました',
      )
    }
  }

  const handleEditClick = (goal: Goal) => {
    setEditingGoal(goal)
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingGoal(undefined)
    }
  }

  const getMonthFromTargetDate = (
    targetDate: string | null,
    createdAt: string,
  ): number => {
    if (targetDate) {
      return new Date(targetDate).getMonth() + 1
    }
    return new Date(createdAt).getMonth() + 1
  }

  const { yearlyGoals, monthlyGoalsByMonth } = useMemo(() => {
    const yearly: Goal[] = []
    const monthly: Record<number, Goal[]> = {}

    goals.forEach((goal) => {
      if (goal.periodType === 'yearly') {
        const goalYear = goal.targetDate
          ? new Date(goal.targetDate).getFullYear()
          : new Date(goal.createdAt).getFullYear()
        if (goalYear === selectedYear) {
          yearly.push(goal)
        }
      } else if (goal.periodType === 'monthly') {
        const month = getMonthFromTargetDate(goal.targetDate, goal.createdAt)
        const goalYear = goal.targetDate
          ? new Date(goal.targetDate).getFullYear()
          : new Date(goal.createdAt).getFullYear()
        if (goalYear === selectedYear) {
          if (!monthly[month]) {
            monthly[month] = []
          }
          monthly[month].push(goal)
        }
      }
    })

    return { yearlyGoals: yearly, monthlyGoalsByMonth: monthly }
  }, [goals, selectedYear])

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    goals.forEach((goal) => {
      const year = goal.targetDate
        ? new Date(goal.targetDate).getFullYear()
        : new Date(goal.createdAt).getFullYear()
      years.add(year)
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [goals])

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-2">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← ホームに戻る
            </Link>
          </div>
          <h1 className="text-3xl font-bold">目標管理</h1>
          <p className="text-muted-foreground mt-2">
            あなたの目標を管理しましょう
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>新しい目標を作成</Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="year-select" className="text-sm font-medium">
            年:
          </label>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(Number(value))}
          >
            <SelectTrigger id="year-select" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.length > 0 ? (
                availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}年
                  </SelectItem>
                ))
              ) : (
                <SelectItem value={selectedYear.toString()}>
                  {selectedYear}年
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(error || createError) && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <span>{createError || error}</span>
          <button
            onClick={() => {
              setCreateError(null)
            }}
            className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">閉じる</span>
          </button>
        </div>
      )}

      {isLoading ? (
        <Loading />
      ) : yearlyGoals.length === 0 &&
        Object.keys(monthlyGoalsByMonth).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {selectedYear}年の目標がありません。新しい目標を作成しましょう。
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {yearlyGoals.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/30 p-6 dark:border-zinc-800 dark:bg-zinc-950/30">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                年間目標
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {yearlyGoals.map((goal) => (
                  <Card
                    key={goal.id}
                    className="group relative border-zinc-200 dark:border-zinc-800"
                  >
                    <CardHeader>
                      <CardTitle className="text-zinc-900 dark:text-zinc-100">
                        {goal.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {goal.targetDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              達成予定日:
                            </span>
                            <span>
                              {new Date(goal.targetDate).toLocaleDateString(
                                'ja-JP',
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(goal)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">編集</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-6 dark:border-stone-800 dark:bg-stone-950/30">
            <h2 className="mb-4 text-xl font-semibold text-stone-900 dark:text-stone-100">
              月間目標
            </h2>
            <Accordion type="multiple" className="w-full">
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
                      isCurrentMonth
                        ? 'border-stone-300 dark:border-stone-700'
                        : ''
                    }
                  >
                    <AccordionTrigger
                      className={
                        isCurrentMonth ? 'text-blue-600 dark:text-blue-400' : ''
                      }
                    >
                      {month}月
                    </AccordionTrigger>
                    <AccordionContent>
                      {monthGoals.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          この月の目標はありません
                        </p>
                      ) : (
                        <div className="grid gap-4 grid-cols-1">
                          {monthGoals.map((goal) => (
                            <Card
                              key={goal.id}
                              className="group relative border-stone-200 dark:border-stone-800"
                            >
                              <CardHeader>
                                <CardTitle className="text-stone-900 dark:text-stone-100">
                                  {goal.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2 text-sm">
                                  {goal.targetDate && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        達成予定日:
                                      </span>
                                      <span>
                                        {new Date(
                                          goal.targetDate,
                                        ).toLocaleDateString('ja-JP')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                              <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditClick(goal)}
                                  className="h-8 w-8"
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">編集</span>
                                </Button>
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
        </div>
      )}

      <GoalDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
        goal={editingGoal}
      />
    </div>
  )
}

export default GoalsPage
