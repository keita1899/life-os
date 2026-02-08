'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskList } from '@/components/tasks/TaskList'
import type { Task } from '@/lib/types/task'

interface DevLogTasksSectionProps {
  tasks: Task[]
  getTargetLabel?: (task: Task) => string
  onToggleCompletion?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onUpdateExecutionDate?: (task: Task, executionDate: string | null) => void
}

export function DevLogTasksSection({
  tasks,
  getTargetLabel,
  onToggleCompletion,
  onEdit,
  onDelete,
  onUpdateExecutionDate,
}: DevLogTasksSectionProps) {
  return (
    <Card className="border-stone-200/60 dark:border-stone-700/40">
      <CardHeader>
        <CardTitle className="text-lg">タスク</CardTitle>
      </CardHeader>
      <CardContent>
        <TaskList
          tasks={tasks}
          getTaskLabel={getTargetLabel}
          onToggleCompletion={onToggleCompletion}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdateExecutionDate={onUpdateExecutionDate}
        />
      </CardContent>
    </Card>
  )
}
