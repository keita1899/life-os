'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GoalForm } from './GoalForm'
import type { CreateGoalInput, Goal } from '@/lib/types/goal'

interface GoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateGoalInput) => Promise<void>
  goal?: Goal
}

export const GoalDialog = ({
  open,
  onOpenChange,
  onSubmit,
  goal,
}: GoalDialogProps) => {
  const handleSubmit = async (input: CreateGoalInput) => {
    await onSubmit(input)
    onOpenChange(false)
  }

  const isEditMode = !!goal

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? '目標を編集' : '新しい目標を作成'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? '目標の詳細を編集してください'
              : '目標の詳細を入力してください'}
          </DialogDescription>
        </DialogHeader>
        <GoalForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          initialData={goal}
          submitLabel={isEditMode ? '更新' : '作成'}
        />
      </DialogContent>
    </Dialog>
  )
}
