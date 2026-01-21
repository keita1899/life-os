'use client'

import { CheckSquare } from 'lucide-react'
import { formatDateDisplay } from '@/lib/date/formats'
import type { Task } from '@/lib/types/task'

interface TaskPopoverContentProps {
  task: Task
}

export function TaskPopoverContent({ task }: TaskPopoverContentProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          {task.title}
        </h3>
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        {task.executionDate && (
          <div className="flex items-center gap-2">
            <CheckSquare className="h-3 w-3" />
            <span>実行日: {formatDateDisplay(task.executionDate)}</span>
          </div>
        )}
        {task.estimatedTime && (
          <div className="flex items-center gap-2">
            <span>見積時間: {task.estimatedTime}分</span>
          </div>
        )}
        {task.completed && (
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-green-100 px-2 py-0.5 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              完了
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
