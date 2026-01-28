'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskList } from '@/components/tasks/TaskList'
import type { Task } from '@/lib/types/task'

interface DevLogTasksSectionProps {
  tasks: Task[]
  onToggleCompletion?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onUpdateExecutionDate?: (task: Task, executionDate: string | null) => void
}

export function DevLogTasksSection({
  tasks,
  onToggleCompletion,
  onEdit,
  onDelete,
  onUpdateExecutionDate,
}: DevLogTasksSectionProps) {
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
