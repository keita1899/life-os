'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MonthlyGoalForm } from './MonthlyGoalForm'
import type { MonthlyGoal, CreateMonthlyGoalInput } from '@/lib/types/monthly-goal'

interface MonthlyGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateMonthlyGoalInput) => Promise<void>
  goal?: MonthlyGoal
  selectedYear?: number
}

export const MonthlyGoalDialog = ({
  open,
  onOpenChange,
  onSubmit,
  goal,
  selectedYear,
}: MonthlyGoalDialogProps) => {
  const handleSubmit = async (input: CreateMonthlyGoalInput) => {
    await onSubmit(input)
    onOpenChange(false)
  }

  const isEditMode = !!goal

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? '月間目標を編集' : '新しい月間目標を作成'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? '月間目標の詳細を編集してください'
              : '月間目標の詳細を入力してください'}
          </DialogDescription>
        </DialogHeader>
        <MonthlyGoalForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          initialData={goal}
          submitLabel={isEditMode ? '更新' : '作成'}
          selectedYear={selectedYear}
        />
      </DialogContent>
    </Dialog>
  )
}
