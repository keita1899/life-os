'use client'

import { FormDialog } from '@/components/ui/form-dialog'
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
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      initialData={task}
      title={{
        create: '新しいタスクを作成',
        edit: 'タスクを編集',
      }}
      formComponent={TaskForm}
    />
  )
}
