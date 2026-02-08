'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useMode } from '@/lib/contexts/ModeContext'
import { YearSelect } from '@/components/goals/YearSelect'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useDevGoals } from '@/hooks/useDevGoals'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
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
  const { operationError, setOperationError, execute } = useAsyncOperation()
  const deleteConfirm = useDeleteConfirm<DevYearlyGoal | DevMonthlyGoal>()
  const [editingYearlyGoal, setEditingYearlyGoal] = useState<
    DevYearlyGoal | undefined
  >(undefined)
  const [editingMonthlyGoal, setEditingMonthlyGoal] = useState<
    DevMonthlyGoal | undefined
  >(undefined)

  const handleCreateYearlyGoal = async (input: CreateDevYearlyGoalInput) => {
    const result = await execute(
      () => createYearlyGoal(input),
      '年間目標の作成に失敗しました',
    )
    if (result !== undefined) {
      setIsYearlyDialogOpen(false)
    }
  }

  const handleUpdateYearlyGoal = async (input: CreateDevYearlyGoalInput) => {
    if (!editingYearlyGoal) return
    const result = await execute(
      async () => {
        await updateYearlyGoal(editingYearlyGoal.id, {
          title: input.title,
          year: input.year,
          checklist: input.checklist,
        })
        return true
      },
      '年間目標の更新に失敗しました',
    )
    if (result !== undefined) {
      setIsYearlyDialogOpen(false)
      setEditingYearlyGoal(undefined)
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
    goal: DevYearlyGoal,
    itemId: string,
    completed: boolean,
  ) => {
    await execute(
      async () => {
        const updatedChecklist = goal.checklist.map((item) =>
          item.id === itemId ? { ...item, completed } : item,
        )
        await updateDevYearlyGoal(goal.id, {
          checklist: updatedChecklist,
        })
        await refreshGoals()
        return true
      },
      'チェックリスト項目の更新に失敗しました',
    )
  }

  const handleToggleMonthlyGoalChecklistItem = async (
    goal: DevMonthlyGoal,
    itemId: string,
    completed: boolean,
  ) => {
    await execute(
      async () => {
        const updatedChecklist = goal.checklist.map((item) =>
          item.id === itemId ? { ...item, completed } : item,
        )
        await updateDevMonthlyGoal(goal.id, {
          checklist: updatedChecklist,
        })
        await refreshGoals()
        return true
      },
      'チェックリスト項目の更新に失敗しました',
    )
  }

  const handleCreateMonthlyGoal = async (input: CreateDevMonthlyGoalInput) => {
    const result = await execute(
      () => createMonthlyGoal(input),
      '月間目標の作成に失敗しました',
    )
    if (result !== undefined) {
      setIsMonthlyDialogOpen(false)
    }
  }

  const handleUpdateMonthlyGoal = async (input: CreateDevMonthlyGoalInput) => {
    if (!editingMonthlyGoal) return
    const result = await execute(
      async () => {
        await updateMonthlyGoal(editingMonthlyGoal.id, {
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
      setIsMonthlyDialogOpen(false)
      setEditingMonthlyGoal(undefined)
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
          open={!!deleteConfirm.deletingItem}
          message={`「${deleteConfirm.deletingItem?.title}」を削除してもよろしいですか？`}
          onConfirm={handleDeleteGoal}
          onCancel={deleteConfirm.handleDeleteCancel}
        />
      </div>
    </MainLayout>
  )
}
