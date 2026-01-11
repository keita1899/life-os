'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { YearlyGoalForm } from './YearlyGoalForm'
import type { YearlyGoal, CreateYearlyGoalInput } from '@/lib/types/yearly-goal'

interface YearlyGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateYearlyGoalInput) => Promise<void>
  goal?: YearlyGoal
  selectedYear?: number
}

export const YearlyGoalDialog = ({
  open,
  onOpenChange,
  onSubmit,
  goal,
  selectedYear,
}: YearlyGoalDialogProps) => {
  const handleSubmit = async (input: CreateYearlyGoalInput) => {
    await onSubmit(input)
    onOpenChange(false)
  }

  const isEditMode = !!goal

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? '年間目標を編集' : '新しい年間目標を作成'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? '年間目標の詳細を編集してください'
              : '年間目標の詳細を入力してください'}
          </DialogDescription>
        </DialogHeader>
        <YearlyGoalForm
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
