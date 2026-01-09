'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GoalForm } from './GoalForm'
import type { CreateGoalInput } from '@/lib/types/goal'

interface GoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateGoalInput) => Promise<void>
}

export const GoalDialog = ({
  open,
  onOpenChange,
  onSubmit,
}: GoalDialogProps) => {
  const handleSubmit = async (input: CreateGoalInput) => {
    await onSubmit(input)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新しい目標を作成</DialogTitle>
          <DialogDescription>目標の詳細を入力してください</DialogDescription>
        </DialogHeader>
        <GoalForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
