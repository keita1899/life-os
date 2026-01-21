'use client'

import { useState, useMemo } from 'react'
import { useGoals } from '@/hooks/useGoals'
import { YearlyGoalDialog } from '@/components/goals/YearlyGoalDialog'
import { MonthlyGoalDialog } from '@/components/goals/MonthlyGoalDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { YearSelect } from '@/components/goals/YearSelect'
import { YearlyGoalsSection } from '@/components/goals/YearlyGoalsSection'
import { MonthlyGoalsSection } from '@/components/goals/MonthlyGoalsSection'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { useMode } from '@/lib/contexts/ModeContext'
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
  const [operationError, setOperationError] = useState<string | null>(null)
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean
    message: string
    onConfirm: () => Promise<void>
  }>({ open: false, message: '', onConfirm: async () => {} })
  const [editingYearlyGoal, setEditingYearlyGoal] = useState<
    YearlyGoal | undefined
  >(undefined)
  const [editingMonthlyGoal, setEditingMonthlyGoal] = useState<
    MonthlyGoal | undefined
  >(undefined)

  const handleCreateYearlyGoal = async (input: CreateYearlyGoalInput) => {
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

  const handleCreateMonthlyGoal = async (input: CreateMonthlyGoalInput) => {
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

  const handleUpdateYearlyGoal = async (input: CreateYearlyGoalInput) => {
    if (!editingYearlyGoal) return
    try {
      setOperationError(null)
      await updateYearlyGoal(editingYearlyGoal.id, {
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

  const handleUpdateMonthlyGoal = async (input: CreateMonthlyGoalInput) => {
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

  const handleEditClick = (goal: YearlyGoal | MonthlyGoal) => {
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

  const { mode } = useMode()

  if (mode !== 'life') {
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
            goals={yearlyGoals}
            onCreateClick={() => {
              setEditingYearlyGoal(undefined)
              setIsYearlyDialogOpen(true)
            }}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />

          <MonthlyGoalsSection
            goals={allMonthlyGoals}
            selectedYear={selectedYear}
            onCreateClick={() => {
              setEditingMonthlyGoal(undefined)
              setIsMonthlyDialogOpen(true)
            }}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
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
          editingMonthlyGoal ? handleUpdateMonthlyGoal : handleCreateMonthlyGoal
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

export default GoalsPage
