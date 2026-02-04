'use client'

import { useState } from 'react'
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
import { updateDevYearlyGoal } from '@/lib/dev/goals/yearly'
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
        year: input.year,
        checklist: input.checklist,
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

  const handleToggleYearlyGoalChecklistItem = async (
    goal: DevYearlyGoal,
    itemId: string,
    completed: boolean,
  ) => {
    try {
      setOperationError(null)
      const updatedChecklist = goal.checklist.map((item) =>
        item.id === itemId ? { ...item, completed } : item,
      )
      await updateDevYearlyGoal(goal.id, {
        checklist: updatedChecklist,
      })
      await refreshGoals()
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : 'チェックリスト項目の更新に失敗しました',
      )
    }
  }

  const handleToggleMonthlyGoalChecklistItem = async (
    goal: DevMonthlyGoal,
    itemId: string,
    completed: boolean,
  ) => {
    try {
      setOperationError(null)
      const updatedChecklist = goal.checklist.map((item) =>
        item.id === itemId ? { ...item, completed } : item,
      )
      await updateDevMonthlyGoal(goal.id, {
        checklist: updatedChecklist,
      })
      await refreshGoals()
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : 'チェックリスト項目の更新に失敗しました',
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
        year: input.year,
        month: input.month,
        checklist: input.checklist,
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
              goals={yearlyGoals}
              onCreateClick={() => {
                setEditingYearlyGoal(undefined)
                setIsYearlyDialogOpen(true)
              }}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onToggleChecklistItem={handleToggleYearlyGoalChecklistItem}
            />

            <div className="border-t border-stone-200 dark:border-stone-800" />

            <MonthlyGoalsSection
              goals={monthlyGoals}
              selectedYear={selectedYear}
              onCreateClick={() => {
                setEditingMonthlyGoal(undefined)
                setIsMonthlyDialogOpen(true)
              }}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onToggleChecklistItem={handleToggleMonthlyGoalChecklistItem}
            />
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
