'use client'

import { useState, useMemo } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useMode } from '@/lib/contexts/ModeContext'
import { YearSelect } from '@/components/goals/YearSelect'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useDevGoals } from '@/hooks/useDevGoals'
import { YearlyGoalDialog } from '@/components/dev/goals/YearlyGoalDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { YearlyGoalsSection } from '@/components/dev/goals/YearlyGoalsSection'
import { updateDevYearlyGoal } from '@/lib/dev/goals/yearly'
import type {
  DevYearlyGoal,
  CreateDevYearlyGoalInput,
} from '@/lib/types/dev-yearly-goal'

export default function DevGoalsPage() {
  const { mode } = useMode()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const {
    yearlyGoals,
    availableYears,
    isLoading,
    error,
    createYearlyGoal,
    deleteYearlyGoal,
    toggleYearlyGoalAchievement,
    refreshGoals,
  } = useDevGoals(selectedYear)
  const [isYearlyDialogOpen, setIsYearlyDialogOpen] = useState(false)
  const [operationError, setOperationError] = useState<string | null>(null)
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean
    message: string
    onConfirm: () => Promise<void>
  }>({ open: false, message: '', onConfirm: async () => {} })
  const [editingYearlyGoal, setEditingYearlyGoal] = useState<
    DevYearlyGoal | undefined
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
      await updateDevYearlyGoal(editingYearlyGoal.id, {
        title: input.title,
        targetDate: input.targetDate,
        year: input.year,
      })
      await refreshGoals()
      setIsYearlyDialogOpen(false)
      setEditingYearlyGoal(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '年間目標の更新に失敗しました',
      )
    }
  }

  const handleEditClick = (goal: DevYearlyGoal) => {
    setEditingYearlyGoal(goal)
    setIsYearlyDialogOpen(true)
  }

  const handleDeleteClick = (
    e: React.MouseEvent,
    goal: DevYearlyGoal,
  ) => {
    e.preventDefault()
    e.stopPropagation()

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
          await deleteYearlyGoal(goal.id)
          await refreshGoals()
        } catch (err) {
          setOperationError(
            err instanceof Error
              ? err.message
              : '年間目標の削除に失敗しました',
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

  const handleYearlyDialogClose = (open: boolean) => {
    setIsYearlyDialogOpen(open)
    if (!open) {
      setEditingYearlyGoal(undefined)
    }
  }

  const activeYearlyGoals = useMemo(
    () => yearlyGoals.filter((goal) => !goal.achieved),
    [yearlyGoals],
  )

  const achievedYearlyGoals = useMemo(
    () => yearlyGoals.filter((goal) => goal.achieved),
    [yearlyGoals],
  )

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
            availableYears={availableYears}
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

            {achievedYearlyGoals.length > 0 && (
              <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-6 dark:border-stone-800 dark:bg-stone-950/30">
                <h2 className="mb-4 text-xl font-semibold text-stone-900 dark:text-stone-100">
                  達成した目標
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      年間目標
                    </h3>
                    <YearlyGoalsSection
                      goals={achievedYearlyGoals}
                      onCreateClick={() => {}}
                      onEditClick={handleEditClick}
                      onDeleteClick={handleDeleteClick}
                      onToggleAchievement={handleToggleYearlyGoalAchievement}
                    />
                  </div>
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
