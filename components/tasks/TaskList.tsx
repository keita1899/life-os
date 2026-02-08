'use client'

import { EmptyState } from '@/components/ui/empty-state'
import { TaskItem } from './TaskItem'
import type { Task } from '@/lib/types/task'

interface TaskListProps {
  tasks: Task[]
  getTaskLabel?: (task: Task) => string | undefined
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onToggleCompletion?: (task: Task) => void
  onUpdateExecutionDate?: (task: Task, executionDate: string | null) => void
}

export function TaskList({
  tasks,
  getTaskLabel,
  onEdit,
  onDelete,
  onToggleCompletion,
  onUpdateExecutionDate,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState message="タスクがありません" />
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          label={getTaskLabel?.(task)}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleCompletion={onToggleCompletion}
          onUpdateExecutionDate={onUpdateExecutionDate}
        />
      ))}
    </div>
  )
}
