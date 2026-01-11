'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { X, Pencil, Trash2 } from 'lucide-react'
import { useGoals } from '@/hooks/useGoals'
import { YearlyGoalDialog } from '@/components/goals/YearlyGoalDialog'
import { MonthlyGoalDialog } from '@/components/goals/MonthlyGoalDialog'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { YearlyGoal, CreateYearlyGoalInput } from '@/lib/types/yearly-goal'
import type {
  MonthlyGoal,
  CreateMonthlyGoalInput,
} from '@/lib/types/monthly-goal'
import { updateYearlyGoal } from '@/lib/goals/yearly'
import { updateMonthlyGoal } from '@/lib/goals/monthly'

const GoalsPage = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const {
    yearlyGoals,
    monthlyGoals: allMonthlyGoals,
    availableYears,
    isLoading,
    error,
    createYearlyGoal,
    createMonthlyGoal,
    deleteYearlyGoal,
    deleteMonthlyGoal,
    refreshGoals,
  } = useGoals(selectedYear)
  const [isYearlyDialogOpen, setIsYearlyDialogOpen] = useState(false)
  const [isMonthlyDialogOpen, setIsMonthlyDialogOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean
    message: string
    onConfirm: () => void
  }>({ open: false, message: '', onConfirm: () => {} })
  const [editingYearlyGoal, setEditingYearlyGoal] = useState<
    YearlyGoal | undefined
  >(undefined)
  const [editingMonthlyGoal, setEditingMonthlyGoal] = useState<
    MonthlyGoal | undefined
  >(undefined)

  const handleCreateYearlyGoal = async (input: CreateYearlyGoalInput) => {
    try {
      setCreateError(null)
      await createYearlyGoal(input)
      setIsYearlyDialogOpen(false)
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : '年間目標の作成に失敗しました',
      )
    }
  }

  const handleCreateMonthlyGoal = async (input: CreateMonthlyGoalInput) => {
    try {
      setCreateError(null)
      await createMonthlyGoal(input)
      setIsMonthlyDialogOpen(false)
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : '月間目標の作成に失敗しました',
      )
    }
  }

  const handleUpdateYearlyGoal = async (input: CreateYearlyGoalInput) => {
    if (!editingYearlyGoal) return
    try {
      setCreateError(null)
      await updateYearlyGoal(editingYearlyGoal.id, {
        title: input.title,
        targetDate: input.targetDate,
        year: input.year,
      })
      await refreshGoals()
      setIsYearlyDialogOpen(false)
      setEditingYearlyGoal(undefined)
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : '年間目標の更新に失敗しました',
      )
    }
  }

  const handleUpdateMonthlyGoal = async (input: CreateMonthlyGoalInput) => {
    if (!editingMonthlyGoal) return
    try {
      setCreateError(null)
      await updateMonthlyGoal(editingMonthlyGoal.id, {
        title: input.title,
        targetDate: input.targetDate,
        year: input.year,
        month: input.month,
      })
      await refreshGoals()
      setIsMonthlyDialogOpen(false)
      setEditingMonthlyGoal(undefined)
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : '月間目標の更新に失敗しました',
      )
    }
  }

  const handleEditClick = (goal: YearlyGoal | MonthlyGoal) => {
    if ('month' in goal) {
      setEditingMonthlyGoal(goal)
      setIsMonthlyDialogOpen(true)
    } else {
      setEditingYearlyGoal(goal)
      setIsYearlyDialogOpen(true)
    }
  }

  const handleDeleteClick = async (
    e: React.MouseEvent,
    goal: YearlyGoal | MonthlyGoal,
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const goalType = 'month' in goal ? '月間目標' : '年間目標'
    const message = `「${goal.title}」を削除してもよろしいですか？`

    setDeleteConfirmDialog({
      open: true,
      message,
      onConfirm: async () => {
        setDeleteConfirmDialog({
          open: false,
          message: '',
          onConfirm: () => {},
        })

        try {
          setCreateError(null)
          if ('month' in goal) {
            await deleteMonthlyGoal(goal.id)
          } else {
            await deleteYearlyGoal(goal.id)
          }
        } catch (err) {
          setCreateError(
            err instanceof Error
              ? err.message
              : `${goalType}の削除に失敗しました`,
          )
        }
      },
    })
  }

  const handleYearlyDialogClose = (open: boolean) => {
    setIsYearlyDialogOpen(open)
    if (!open) {
      setEditingYearlyGoal(undefined)
    }
  }

  const handleMonthlyDialogClose = (open: boolean) => {
    setIsMonthlyDialogOpen(open)
    if (!open) {
      setEditingMonthlyGoal(undefined)
    }
  }

  const monthlyGoalsByMonth = useMemo(() => {
    const monthly: Record<number, MonthlyGoal[]> = {}

    allMonthlyGoals.forEach((goal) => {
      if (!monthly[goal.month]) {
        monthly[goal.month] = []
      }
      monthly[goal.month].push(goal)
    })

    return monthly
  }, [allMonthlyGoals])

  const displayAvailableYears =
    availableYears.length > 0 ? availableYears : [selectedYear]

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6">
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
              {displayAvailableYears.map((year) => {
                const currentYear = new Date().getFullYear()
                const isCurrentYear = year === currentYear

                return (
                  <SelectItem
                    key={year}
                    value={year.toString()}
                    className={
                      isCurrentYear
                        ? 'text-blue-600 dark:text-blue-400 focus:text-blue-600 dark:focus:text-blue-400'
                        : ''
                    }
                  >
                    {year}年
                  </SelectItem>
                )
              })}
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
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/30 p-6 dark:border-zinc-800 dark:bg-zinc-950/30">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                年間目標
              </h2>
              <Button
                onClick={() => {
                  setEditingYearlyGoal(undefined)
                  setIsYearlyDialogOpen(true)
                }}
                size="sm"
              >
                年間目標を作成
              </Button>
            </div>
            {yearlyGoals.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {yearlyGoals.map((goal) => (
                  <Card
                    key={goal.id}
                    className="group relative bg-white border-zinc-200 dark:bg-white dark:border-zinc-200"
                  >
                    <CardHeader>
                      <CardTitle className="text-black dark:text-black">
                        {goal.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {goal.targetDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">期限</span>
                            <span className="text-black dark:text-black">
                              {new Date(goal.targetDate).toLocaleDateString(
                                'ja-JP',
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <div className="absolute right-4 top-4 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(goal)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">編集</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteClick(e, goal)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 z-10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">削除</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                年間目標はありません
              </p>
            )}
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-6 dark:border-stone-800 dark:bg-stone-950/30">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
                月間目標
              </h2>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingMonthlyGoal(undefined)
                  setIsMonthlyDialogOpen(true)
                }}
                size="sm"
              >
                月間目標を作成
              </Button>
            </div>
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
                              <div className="absolute right-4 top-4 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditClick(goal)}
                                  className="h-8 w-8"
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">編集</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => handleDeleteClick(e, goal)}
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">削除</span>
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

      <YearlyGoalDialog
        open={isYearlyDialogOpen}
        onOpenChange={handleYearlyDialogClose}
        onSubmit={
          editingYearlyGoal ? handleUpdateYearlyGoal : handleCreateYearlyGoal
        }
        goal={editingYearlyGoal}
        selectedYear={selectedYear}
      />

      <MonthlyGoalDialog
        open={isMonthlyDialogOpen}
        onOpenChange={handleMonthlyDialogClose}
        onSubmit={
          editingMonthlyGoal ? handleUpdateMonthlyGoal : handleCreateMonthlyGoal
        }
        goal={editingMonthlyGoal}
        selectedYear={selectedYear}
      />

      <Dialog
        open={deleteConfirmDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmDialog({
              open: false,
              message: '',
              onConfirm: () => {},
            })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>削除の確認</DialogTitle>
            <DialogDescription>{deleteConfirmDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmDialog({
                  open: false,
                  message: '',
                  onConfirm: () => {},
                })
              }}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={deleteConfirmDialog.onConfirm}
            >
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GoalsPage
