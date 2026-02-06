'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LogTaskItem } from '@/components/logs/LogTaskItem'
import type { Task } from '@/lib/types/task'

interface LogTasksSectionProps {
  tasks: Task[]
  onToggleCompletion?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
}

export function LogTasksSection({
  tasks,
  onToggleCompletion,
  onEdit,
  onDelete,
}: LogTasksSectionProps) {
  return (
    <Card className="border-stone-200/60 dark:border-stone-700/40">
      <CardHeader>
        <CardTitle className="text-lg">タスク</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <EmptyState message="タスクがありません" />
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <LogTaskItem
                key={task.id}
                task={task}
                onToggleCompletion={onToggleCompletion}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
