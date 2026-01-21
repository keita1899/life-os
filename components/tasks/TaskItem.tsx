'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  CheckCircle2,
  Circle,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
} from 'lucide-react'
import { getDateLabel } from '@/lib/date/labels'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  getTodayDateString,
  getTomorrowDateString,
  formatDateForInput,
} from '@/lib/date/formats'
import type { Task } from '@/lib/types/task'

interface TaskItemProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onToggleCompletion?: (task: Task) => void
  onUpdateExecutionDate?: (task: Task, executionDate: string | null) => void
}

const DATE_LABEL_STYLES: Record<string, string> = {
  today: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  tomorrow: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  future: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
}

const DEFAULT_DATE_STYLE =
  'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'

export function TaskItem({
  task,
  onEdit,
  onDelete,
  onToggleCompletion,
  onUpdateExecutionDate,
}: TaskItemProps) {
  const dateLabel = useMemo(
    () => getDateLabel(task.executionDate),
    [task.executionDate],
  )

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [customDate, setCustomDate] = useState(
    formatDateForInput(task.executionDate),
  )

  useEffect(() => {
    setCustomDate(formatDateForInput(task.executionDate))
  }, [task.executionDate])

  const handleDateSelect = (date: string | null) => {
    onUpdateExecutionDate?.(task, date)
  }

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customDate) {
      handleDateSelect(customDate)
      setIsDatePickerOpen(false)
    }
  }

  const dateLabelStyle = dateLabel
    ? DATE_LABEL_STYLES[dateLabel.type] || DEFAULT_DATE_STYLE
    : DEFAULT_DATE_STYLE

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border p-4',
        task.completed
          ? 'border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-950'
          : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900',
      )}
    >
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
              <Circle className="h-5 w-5 text-stone-400" />
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
        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
          {task.estimatedTime && <div>見積もり: {task.estimatedTime}分</div>}
          {task.actualTime > 0 && <div>実績: {task.actualTime}分</div>}
        </div>
      </div>
      <div className="mt-0.5 flex items-center gap-2">
        {!task.completed && onUpdateExecutionDate && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'rounded-md px-2.5 py-1 text-sm font-medium transition-colors hover:opacity-80',
                    dateLabelStyle,
                  )}
                >
                  {dateLabel?.text ?? '日付なし'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleDateSelect(getTodayDateString())}
                >
                  今日
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDateSelect(getTomorrowDateString())}
                >
                  明日
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDateSelect(null)}>
                  日付なし
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    setIsDatePickerOpen(true)
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  カレンダー
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverContent className="w-auto p-3" align="end">
                <form onSubmit={handleCustomDateSubmit} className="space-y-2">
                  <Input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full"
                  />
                  <Button type="submit" size="sm" className="w-full">
                    設定
                  </Button>
                </form>
              </PopoverContent>
            </Popover>
          </>
        )}
        {!task.completed && !onUpdateExecutionDate && dateLabel && (
          <span
            className={cn('rounded-md px-2.5 py-1 text-sm font-medium', dateLabelStyle)}
          >
            {dateLabel.text}
          </span>
        )}
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
