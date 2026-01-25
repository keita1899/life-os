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
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
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

  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [customDate, setCustomDate] = useState(
    formatDateForInput(task.executionDate),
  )

  useEffect(() => {
    setCustomDate(formatDateForInput(task.executionDate))
  }, [task.executionDate])

  useEffect(() => {
    if (!isDateMenuOpen) {
      setShowCalendar(false)
    }
  }, [isDateMenuOpen])

  const handleDateSelect = (date: string | null) => {
    onUpdateExecutionDate?.(task, date)
    setIsDateMenuOpen(false)
  }

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customDate) {
      handleDateSelect(customDate)
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
          {task.actualTime > 0 && <div>実績: {task.actualTime}分</div>}
        </div>
      </div>
      <div className="mt-0.5 flex items-center gap-2">
        {!task.completed && onUpdateExecutionDate && (
          <Popover open={isDateMenuOpen} onOpenChange={setIsDateMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  'rounded-md px-2.5 py-1 text-sm font-medium transition-colors hover:opacity-80',
                  dateLabelStyle,
                )}
              >
                {dateLabel?.text ?? '日付なし'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="end">
              {!showCalendar ? (
                <div className="flex flex-col">
                  <button
                    type="button"
                    className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
                    onClick={() => handleDateSelect(getTodayDateString())}
                  >
                    今日
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
                    onClick={() => handleDateSelect(getTomorrowDateString())}
                  >
                    明日
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
                    onClick={() => handleDateSelect(null)}
                  >
                    日付なし
                  </button>
                  <div className="my-1 h-px bg-stone-200 dark:bg-stone-700" />
                  <button
                    type="button"
                    className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
                    onClick={() => setShowCalendar(true)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    カレンダー
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomDateSubmit} className="space-y-2 p-2">
                  <Input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowCalendar(false)}
                    >
                      戻る
                    </Button>
                    <Button type="submit" size="sm" className="flex-1">
                      設定
                    </Button>
                  </div>
                </form>
              )}
            </PopoverContent>
          </Popover>
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
