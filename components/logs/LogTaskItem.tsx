'use client'

import { useMemo } from 'react'
import {
  CheckCircle2,
  Circle,
  Clock,
  Repeat,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/types/task'

interface LogTaskItemProps {
  task: Task
  onToggleCompletion?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

function getRecurrenceLabel(task: Task): string {
  if (!task.recurrenceRule) return ''
  if (task.recurrenceRule === 'daily') return '毎日'
  if (task.recurrenceRule === 'weekly') {
    const days = task.recurrenceDaysOfWeek
    if (days?.length) {
      const labels = days.map((d) => WEEKDAY_LABELS[d]).join('・')
      return `毎週 ${labels} 曜日`
    }
    return '毎週'
  }
  if (task.recurrenceRule === 'monthly') {
    const dom = task.recurrenceDayOfMonth
    if (dom === 0) return '毎月末'
    if (dom != null) return `毎月${dom}日`
    return '毎月'
  }
  return ''
}

function isValidTimeFormat(time: string | null): boolean {
  if (!time || time.trim() === '') return false
  const trimmed = time.trim()
  return /^\d{2}:\d{2}$/.test(trimmed)
}

export function LogTaskItem({
  task,
  onToggleCompletion,
  onEdit,
  onDelete,
}: LogTaskItemProps) {
  const isValidScheduledTime = useMemo(
    () => isValidTimeFormat(task.scheduledTime),
    [task.scheduledTime],
  )

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border p-4',
        task.completed
          ? 'border-stone-200/60 bg-stone-900/5 dark:border-stone-700/40 dark:bg-stone-900/20'
          : 'border-stone-200/60 bg-stone-900/10 dark:border-stone-700/40 dark:bg-stone-900/20',
      )}
    >
      <div className="mt-0.5 flex min-w-[60px] items-center gap-1 text-sm font-medium">
        {isValidScheduledTime ? (
          <>
            <Clock className="h-4 w-4 shrink-0 text-stone-700 dark:text-stone-300" />
            <span className="text-stone-700 dark:text-stone-300">{task.scheduledTime}</span>
          </>
        ) : (
          <div className="h-4 w-4 shrink-0" />
        )}
      </div>
      <div className="mt-0.5">
        {onToggleCompletion ? (
          <button
            type="button"
            onClick={() => onToggleCompletion(task)}
            className="focus:outline-none"
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-red-500/40 dark:text-red-500/50" />
            )}
          </button>
        ) : task.completed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5 text-stone-400" />
        )}
      </div>
      <div className="flex-1">
        <div
          className={cn(
            'text-sm font-medium',
            task.completed
              ? 'text-stone-500 line-through dark:text-stone-400'
              : 'text-stone-900 dark:text-stone-100',
          )}
        >
          {task.title}
        </div>
        {task.recurrenceRule && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Repeat className="h-3 w-3 shrink-0 text-violet-600 dark:text-violet-400" />
              {getRecurrenceLabel(task)}
            </span>
          </div>
        )}
      </div>
      <div className="mt-0.5 flex items-center gap-2">
        <div className="flex min-w-[40px] items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">メニュー</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!task.completed && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>編集</span>
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(task)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>削除</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
