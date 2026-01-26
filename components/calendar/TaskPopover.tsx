'use client'

import { CheckSquare, Pencil, Trash2 } from 'lucide-react'
import { formatDateDisplay } from '@/lib/date/formats'
import type { Task } from '@/lib/types/task'
import { Button } from '@/components/ui/button'

interface TaskPopoverContentProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
}

export function TaskPopoverContent({ task, onEdit, onDelete }: TaskPopoverContentProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
          {task.title}
        </h3>
        {(onEdit || onDelete) && (
          <div className="flex shrink-0 items-center gap-1">
            {onEdit && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => onEdit(task)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">編集</span>
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(task)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">削除</span>
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        {task.executionDate && (
          <div className="flex items-center gap-2">
            <CheckSquare className="h-3 w-3" />
            <span>実行日: {formatDateDisplay(task.executionDate)}</span>
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
