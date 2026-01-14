'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TaskForm } from './TaskForm'
import type { Task, CreateTaskInput } from '@/lib/types/task'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateTaskInput) => Promise<void>
  task?: Task
}

export const TaskDialog = ({
  open,
  onOpenChange,
  onSubmit,
  task,
}: TaskDialogProps) => {
  const handleSubmit = async (input: CreateTaskInput) => {
    await onSubmit(input)
  }

  const isEditMode = !!task

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'タスクを編集' : '新しいタスクを作成'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'タスクの詳細を編集してください'
              : 'タスクの詳細を入力してください'}
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          initialData={task}
          submitLabel={isEditMode ? '更新' : '作成'}
        />
      </DialogContent>
    </Dialog>
  )
}
