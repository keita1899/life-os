'use client'

import { TaskItem } from './TaskItem'
import type { Task } from '@/lib/types/task'

interface TaskListProps {
  tasks: Task[]
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
}

export function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-8 text-center dark:border-stone-800 dark:bg-stone-950/30">
        <p className="text-muted-foreground">タスクがありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
