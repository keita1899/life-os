'use client'

import { useState } from 'react'
import { useGoals } from '@/hooks/useGoals'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
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
    isLoading,
    error,
    createYearlyGoal,
    createMonthlyGoal,
    deleteYearlyGoal,
    deleteMonthlyGoal,
    refreshGoals,
  } = useGoals(selectedYear)
  const yearlyDialog = useDialogState<YearlyGoal>()
  const monthlyDialog = useDialogState<MonthlyGoal>()
  const { operationError, setOperationError, execute } = useAsyncOperation()
  const deleteConfirm = useDeleteConfirm<YearlyGoal | MonthlyGoal>()

  const handleCreateYearlyGoal = async (input: CreateYearlyGoalInput) => {
    const result = await execute(
      () => createYearlyGoal(input),
      '年間目標の作成に失敗しました',
    )
    if (result !== undefined) {
      yearlyDialog.handleDialogClose(false)
    }
  }

  const handleCreateMonthlyGoal = async (input: CreateMonthlyGoalInput) => {
    const result = await execute(
      () => createMonthlyGoal(input),
      '月間目標の作成に失敗しました',
    )
    if (result !== undefined) {
      monthlyDialog.handleDialogClose(false)
    }
  }

  const handleUpdateYearlyGoal = async (input: CreateYearlyGoalInput) => {
    const goal = yearlyDialog.editingItem
    if (!goal) return
    const result = await execute(
      async () => {
        await updateYearlyGoal(goal.id, {
          title: input.title,
          year: input.year,
          checklist: input.checklist,
        })
        await refreshGoals()
        return true
      },
      '年間目標の更新に失敗しました',
    )
    if (result !== undefined) {
      yearlyDialog.handleDialogClose(false)
    }
  }

  const handleUpdateMonthlyGoal = async (input: CreateMonthlyGoalInput) => {
    const goal = monthlyDialog.editingItem
    if (!goal) return
    const result = await execute(
      async () => {
        await updateMonthlyGoal(goal.id, {
          title: input.title,
          year: input.year,
          month: input.month,
          checklist: input.checklist,
        })
        await refreshGoals()
        return true
      },
      '月間目標の更新に失敗しました',
    )
    if (result !== undefined) {
      monthlyDialog.handleDialogClose(false)
    }
  }

  const handleEditClick = (goal: YearlyGoal | MonthlyGoal) => {
    if ('month' in goal) {
      monthlyDialog.handleEdit(goal)
    } else {
      yearlyDialog.handleEdit(goal)
    }
  }

  const handleDeleteClick = (
    e: React.MouseEvent,
    goal: YearlyGoal | MonthlyGoal,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    deleteConfirm.handleDeleteClick(goal)
  }

  const handleDeleteGoal = async () => {
    const goal = deleteConfirm.deletingItem
    if (!goal) return

    const goalType = 'month' in goal ? '月間目標' : '年間目標'
    const result = await execute(
      async () => {
        if ('month' in goal) {
          await deleteMonthlyGoal(goal.id)
        } else {
          await deleteYearlyGoal(goal.id)
        }
        await refreshGoals()
        return true
      },
      `${goalType}の削除に失敗しました`,
    )
    if (result !== undefined) {
      deleteConfirm.clearDeletingItem()
    }
  }

  const handleToggleYearlyGoalChecklistItem = async (
    goal: YearlyGoal,
    itemId: string,
    completed: boolean,
  ) => {
    await execute(
      async () => {
        const updatedChecklist = goal.checklist.map((item) =>
          item.id === itemId ? { ...item, completed } : item,
        )
        await updateYearlyGoal(goal.id, {
          checklist: updatedChecklist,
        })
        await refreshGoals()
        return true
      },
      'チェックリスト項目の更新に失敗しました',
    )
  }

  const handleToggleMonthlyGoalChecklistItem = async (
    goal: MonthlyGoal,
    itemId: string,
    completed: boolean,
  ) => {
    await execute(
      async () => {
        const updatedChecklist = goal.checklist.map((item) =>
          item.id === itemId ? { ...item, completed } : item,
        )
        await updateMonthlyGoal(goal.id, {
          checklist: updatedChecklist,
        })
        await refreshGoals()
        return true
      },
      'チェックリスト項目の更新に失敗しました',
    )
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
            onCreateClick={yearlyDialog.handleCreateClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onToggleChecklistItem={handleToggleYearlyGoalChecklistItem}
          />

          <div className="border-t border-stone-200 dark:border-stone-800" />

          <MonthlyGoalsSection
            goals={allMonthlyGoals}
            selectedYear={selectedYear}
            onCreateClick={monthlyDialog.handleCreateClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onToggleChecklistItem={handleToggleMonthlyGoalChecklistItem}
          />
        </div>
      )}

      <YearlyGoalDialog
        open={yearlyDialog.isDialogOpen}
        onOpenChange={yearlyDialog.handleDialogClose}
        onSubmit={
          yearlyDialog.editingItem ? handleUpdateYearlyGoal : handleCreateYearlyGoal
        }
        goal={yearlyDialog.editingItem}
        selectedYear={selectedYear}
      />

      <MonthlyGoalDialog
        open={monthlyDialog.isDialogOpen}
        onOpenChange={monthlyDialog.handleDialogClose}
        onSubmit={
          monthlyDialog.editingItem ? handleUpdateMonthlyGoal : handleCreateMonthlyGoal
        }
        goal={monthlyDialog.editingItem}
        selectedYear={selectedYear}
      />

      <DeleteConfirmDialog
        open={!!deleteConfirm.deletingItem}
        message={`「${deleteConfirm.deletingItem?.title}」を削除してもよろしいですか？`}
        onConfirm={handleDeleteGoal}
        onCancel={deleteConfirm.handleDeleteCancel}
      />
      </div>
    </MainLayout>
  )
}

export default GoalsPage
