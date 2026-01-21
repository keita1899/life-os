'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskList } from '@/components/tasks/TaskList'
import type { Task } from '@/lib/types/task'

interface LogTasksSectionProps {
  tasks: Task[]
  onToggleCompletion?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onUpdateExecutionDate?: (task: Task, executionDate: string | null) => void
}

export function LogTasksSection({
  tasks,
  onToggleCompletion,
  onEdit,
  onDelete,
  onUpdateExecutionDate,
}: LogTasksSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">タスク</CardTitle>
      </CardHeader>
      <CardContent>
        <TaskList
          tasks={tasks}
          onToggleCompletion={onToggleCompletion}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdateExecutionDate={onUpdateExecutionDate}
        />
      </CardContent>
    </Card>
  )
}
