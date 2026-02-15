'use client'

import { useState } from 'react'
import { CheckCircle2, CheckSquare, Circle, Pencil, Repeat, Trash2 } from 'lucide-react'
import { formatDateDisplay } from '@/lib/date/formats'
import { cn } from '@/lib/utils'
import type { Task } from '@/features/tasks'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

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

const TASK_TRIGGER_CLASS = {
  month: 'flex w-full items-center gap-1 truncate rounded border px-1 py-0.5 text-left text-xs hover:opacity-80',
  week: 'flex w-full items-center gap-1 rounded border px-2 py-1.5 text-left text-xs hover:opacity-80',
} as const

const TASK_LABEL_CLASS = {
  month: 'min-w-0 flex-1 truncate',
  week: 'min-w-0 flex-1 font-medium line-clamp-2',
} as const

interface TaskPopoverWrapperProps {
  task: Task
  variant: 'month' | 'week'
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onToggleCompletion?: (task: Task) => void
  onOpenChange?: (open: boolean) => void
}

export function TaskPopoverWrapper({
  task,
  variant,
  onEdit,
  onDelete,
  onToggleCompletion,
  onOpenChange,
}: TaskPopoverWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            TASK_TRIGGER_CLASS[variant],
            task.completed
              ? 'border-stone-200/60 bg-stone-900/5 text-stone-600 dark:border-stone-700/40 dark:bg-stone-900/20 dark:text-stone-400'
              : 'border-stone-200/60 bg-stone-900/10 text-stone-900 dark:border-stone-700/40 dark:bg-stone-900/20 dark:text-stone-100',
          )}
          title={task.title}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {onToggleCompletion && (
            <span
              role="button"
              tabIndex={0}
              className="inline-flex h-4 w-4 items-center justify-center"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleCompletion(task)
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return
                e.preventDefault()
                e.stopPropagation()
                onToggleCompletion(task)
              }}
              aria-label={task.completed ? '未完了にする' : '完了にする'}
            >
              {task.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="h-4 w-4 text-stone-400" />
              )}
            </span>
          )}
          {task.recurrenceRule && (
            <Repeat
              className="h-3 w-3 shrink-0 text-muted-foreground"
              aria-label="繰り返し"
            />
          )}
          <span
            className={cn(TASK_LABEL_CLASS[variant], task.completed && 'line-through')}
          >
            {task.title}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <TaskPopoverContent
          task={task}
          onEdit={
            onEdit
              ? (t) => {
                  handleOpenChange(false)
                  onEdit(t)
                }
              : undefined
          }
          onDelete={
            onDelete
              ? (t) => {
                  handleOpenChange(false)
                  onDelete(t)
                }
              : undefined
          }
        />
      </PopoverContent>
    </Popover>
  )
}
