'use client'

import { useState, useMemo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useMode } from '@/lib/contexts/ModeContext'
import { YearSelect } from '@/components/goals/YearSelect'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useDevGoals } from '@/hooks/useDevGoals'
import { YearlyGoalDialog } from '@/components/dev/goals/YearlyGoalDialog'
import { MonthlyGoalDialog } from '@/components/dev/goals/MonthlyGoalDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { YearlyGoalsSection } from '@/components/dev/goals/YearlyGoalsSection'
import { MonthlyGoalsSection } from '@/components/dev/goals/MonthlyGoalsSection'
import { updateDevMonthlyGoal } from '@/lib/dev/goals/monthly'
import type {
  DevYearlyGoal,
  CreateDevYearlyGoalInput,
} from '@/lib/types/dev-yearly-goal'
import type {
  DevMonthlyGoal,
  CreateDevMonthlyGoalInput,
} from '@/lib/types/dev-monthly-goal'

export default function DevGoalsPage() {
  const { mode } = useMode()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const {
    yearlyGoals,
    monthlyGoals,
    isLoading,
    error,
    createYearlyGoal,
    createMonthlyGoal,
    updateYearlyGoal,
    updateMonthlyGoal,
    deleteYearlyGoal,
    deleteMonthlyGoal,
    toggleYearlyGoalAchievement,
    toggleMonthlyGoalAchievement,
    refreshGoals,
  } = useDevGoals(selectedYear)
  const [isYearlyDialogOpen, setIsYearlyDialogOpen] = useState(false)
  const [isMonthlyDialogOpen, setIsMonthlyDialogOpen] = useState(false)
  const [operationError, setOperationError] = useState<string | null>(null)
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean
    message: string
    onConfirm: () => Promise<void>
  }>({ open: false, message: '', onConfirm: async () => {} })
  const [editingYearlyGoal, setEditingYearlyGoal] = useState<
    DevYearlyGoal | undefined
  >(undefined)
  const [editingMonthlyGoal, setEditingMonthlyGoal] = useState<
    DevMonthlyGoal | undefined
  >(undefined)

  const handleCreateYearlyGoal = async (input: CreateDevYearlyGoalInput) => {
    try {
      setOperationError(null)
      await createYearlyGoal(input)
      setIsYearlyDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '年間目標の作成に失敗しました',
      )
    }
  }

  const handleUpdateYearlyGoal = async (input: CreateDevYearlyGoalInput) => {
    if (!editingYearlyGoal) return
    try {
      setOperationError(null)
      await updateYearlyGoal(editingYearlyGoal.id, {
        title: input.title,
        targetDate: input.targetDate,
        year: input.year,
      })
      setIsYearlyDialogOpen(false)
      setEditingYearlyGoal(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '年間目標の更新に失敗しました',
      )
    }
  }

  const handleEditClick = (goal: DevYearlyGoal | DevMonthlyGoal) => {
    if ('month' in goal) {
      setEditingMonthlyGoal(goal)
      setIsMonthlyDialogOpen(true)
    } else {
      setEditingYearlyGoal(goal)
      setIsYearlyDialogOpen(true)
    }
  }

  const handleDeleteClick = (
    e: React.MouseEvent,
    goal: DevYearlyGoal | DevMonthlyGoal,
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
          onConfirm: async () => {},
        })

        try {
          setOperationError(null)
          if ('month' in goal) {
            await deleteMonthlyGoal(goal.id)
          } else {
            await deleteYearlyGoal(goal.id)
          }
          await refreshGoals()
        } catch (err) {
          setOperationError(
            err instanceof Error
              ? err.message
              : `${goalType}の削除に失敗しました`,
          )
        }
      },
    })
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmDialog({
      open: false,
      message: '',
      onConfirm: async () => {},
    })
  }

  const handleToggleYearlyGoalAchievement = async (goal: DevYearlyGoal) => {
    try {
      setOperationError(null)
      await toggleYearlyGoalAchievement(goal.id)
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : '年間目標の達成状態の更新に失敗しました',
      )
    }
  }

  const handleCreateMonthlyGoal = async (input: CreateDevMonthlyGoalInput) => {
    try {
      setOperationError(null)
      await createMonthlyGoal(input)
      setIsMonthlyDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '月間目標の作成に失敗しました',
      )
    }
  }

  const handleUpdateMonthlyGoal = async (input: CreateDevMonthlyGoalInput) => {
    if (!editingMonthlyGoal) return
    try {
      setOperationError(null)
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
      setOperationError(
        err instanceof Error ? err.message : '月間目標の更新に失敗しました',
      )
    }
  }


  const handleToggleMonthlyGoalAchievement = async (goal: DevMonthlyGoal) => {
    try {
      setOperationError(null)
      await toggleMonthlyGoalAchievement(goal.id)
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : '月間目標の達成状態の更新に失敗しました',
      )
    }
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

  const activeYearlyGoals = useMemo(
    () => yearlyGoals.filter((goal) => !goal.achieved),
    [yearlyGoals],
  )

  const activeMonthlyGoals = useMemo(
    () => monthlyGoals.filter((goal) => !goal.achieved),
    [monthlyGoals],
  )

  const achievedYearlyGoals = useMemo(
    () => yearlyGoals.filter((goal) => goal.achieved),
    [yearlyGoals],
  )

  const achievedMonthlyGoals = useMemo(
    () => monthlyGoals.filter((goal) => goal.achieved),
    [monthlyGoals],
  )

  const hasAchievedGoals =
    achievedYearlyGoals.length > 0 || achievedMonthlyGoals.length > 0

  if (mode !== 'development') {
    return null
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">目標</h1>
          <YearSelect
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>

        <ErrorMessage
          message={operationError || error || ''}
          onDismiss={operationError ? () => setOperationError(null) : undefined}
        />

        {isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-6">
            <YearlyGoalsSection
              goals={activeYearlyGoals}
              onCreateClick={() => {
                setEditingYearlyGoal(undefined)
                setIsYearlyDialogOpen(true)
              }}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onToggleAchievement={handleToggleYearlyGoalAchievement}
            />

            <MonthlyGoalsSection
              goals={activeMonthlyGoals}
              selectedYear={selectedYear}
              onCreateClick={() => {
                setEditingMonthlyGoal(undefined)
                setIsMonthlyDialogOpen(true)
              }}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onToggleAchievement={handleToggleMonthlyGoalAchievement}
            />

            {hasAchievedGoals && (
              <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-6 dark:border-stone-800 dark:bg-stone-950/30">
                <h2 className="mb-4 text-xl font-semibold text-stone-900 dark:text-stone-100">
                  達成した目標
                </h2>
                <div className="space-y-6">
                  {achievedYearlyGoals.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        年間目標
                      </h3>
                      <div className="flex flex-col gap-4">
                        {achievedYearlyGoals.map((goal) => (
                          <div
                            key={goal.id}
                            className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => handleToggleYearlyGoalAchievement(goal)}
                                aria-label={`${goal.achieved ? '未達成にする' : '達成にする'}: ${goal.title}`}
                                aria-pressed={goal.achieved}
                                className="mt-0.5 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 focus:outline-none"
                              >
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              </button>
                              <div className="flex-1">
                                <h4 className="line-through text-stone-500 dark:text-stone-400">
                                  {goal.title}
                                </h4>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {goal.year}年
                                </p>
                                {goal.targetDate && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    期限: {new Date(goal.targetDate).toLocaleDateString('ja-JP')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {achievedMonthlyGoals.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        月間目標
                      </h3>
                      <div className="flex flex-col gap-4">
                        {achievedMonthlyGoals.map((goal) => (
                          <div
                            key={goal.id}
                            className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => handleToggleMonthlyGoalAchievement(goal)}
                                aria-label={`${goal.achieved ? '未達成にする' : '達成にする'}: ${goal.title}`}
                                aria-pressed={goal.achieved}
                                className="mt-0.5 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 focus:outline-none"
                              >
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              </button>
                              <div className="flex-1">
                                <h4 className="line-through text-stone-500 dark:text-stone-400">
                                  {goal.title}
                                </h4>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {goal.year}年{goal.month}月
                                </p>
                                {goal.targetDate && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    達成予定日:{' '}
                                    {new Date(goal.targetDate).toLocaleDateString('ja-JP')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
            editingMonthlyGoal
              ? handleUpdateMonthlyGoal
              : handleCreateMonthlyGoal
          }
          goal={editingMonthlyGoal}
          selectedYear={selectedYear}
        />

        <DeleteConfirmDialog
          open={deleteConfirmDialog.open}
          message={deleteConfirmDialog.message}
          onConfirm={deleteConfirmDialog.onConfirm}
          onCancel={handleDeleteCancel}
        />
      </div>
    </MainLayout>
  )
}
