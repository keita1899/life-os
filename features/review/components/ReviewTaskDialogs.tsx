'use client'

import { TaskDialog, RecurringTaskDeleteDialog } from '@/features/tasks'
import type { Task, CreateTaskInput } from '@/features/tasks'

interface ReviewTaskDialogsProps {
  editingTask: Task | null
  deletingTask: Task | null
  onEditClose: () => void
  onEditSubmit: (input: CreateTaskInput) => Promise<void>
  onRecurringDeleteConfirm: (mode: 'single' | 'all') => Promise<void>
  onDeleteCancel: () => void
}

export function ReviewTaskDialogs({
  editingTask,
  deletingTask,
  onEditClose,
  onEditSubmit,
  onRecurringDeleteConfirm,
  onDeleteCancel,
}: ReviewTaskDialogsProps) {
  return (
    <>
      <TaskDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && onEditClose()}
        onSubmit={onEditSubmit}
        task={editingTask ?? undefined}
      />
      {deletingTask && (
        <RecurringTaskDeleteDialog
          open={!!deletingTask}
          taskTitle={deletingTask.title}
          onConfirm={onRecurringDeleteConfirm}
          onCancel={onDeleteCancel}
        />
      )}
    </>
  )
}
