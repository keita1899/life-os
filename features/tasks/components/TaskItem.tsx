'use client'

import { useMemo, useState } from 'react'
import { InlineEditableText } from '@/components/ui/inline-editable-text'
import {
  CheckCircle2,
  Circle,
  Calendar,
  Repeat,
  FileText,
} from 'lucide-react'
import { getDateLabel } from '@/lib/date/labels'
import { Button } from '@/components/ui/button'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  getTodayDateString,
  getTomorrowDateString,
  formatDateForInput,
  isValidTimeFormat,
} from '@/lib/date/formats'
import { useAppMode } from '@/hooks/useAppMode'
import {
  getRecurrenceLabel,
  DATE_LABEL_STYLES,
  DEFAULT_DATE_STYLE,
} from '../lib/task-utils'
import type { Task } from '../types/task'

interface TaskItemProps {
  task: Task
  label?: string
  dateLabelMode?: 'all' | 'overdue-only'
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onToggleCompletion?: (task: Task) => void
  onUpdateExecutionDate?: (task: Task, executionDate: string | null) => void
  onRename?: (task: Task, title: string) => Promise<void>
}

export function TaskItem({
  task,
  label,
  dateLabelMode = 'all',
  onEdit,
  onDelete,
  onToggleCompletion,
  onUpdateExecutionDate,
  onRename,
}: TaskItemProps) {
  const { isDevMode } = useAppMode()
  const dateLabel = useMemo(
    () => getDateLabel(task.executionDate),
    [task.executionDate],
  )
  const shouldShowDateDisplay =
    dateLabelMode !== 'overdue-only' ||
    (!task.completed && dateLabel?.type === 'overdue')

  const isValidScheduledTime = useMemo(
    () => isValidTimeFormat(task.scheduledTime),
    [task.scheduledTime],
  )

  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [customDateDraft, setCustomDateDraft] = useState<string | null>(null)

  const initialCustomDate = useMemo(
    () => formatDateForInput(task.executionDate),
    [task.executionDate],
  )

  const handleDateMenuOpenChange = (open: boolean) => {
    setIsDateMenuOpen(open)
    if (!open) {
      setShowCalendar(false)
      setCustomDateDraft(null)
    }
  }

  const handleDateSelect = (date: string | null) => {
    onUpdateExecutionDate?.(task, date)
    setIsDateMenuOpen(false)
  }

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const date = customDateDraft ?? initialCustomDate
    if (date) {
      handleDateSelect(date)
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
          ? 'border-stone-200/60 bg-stone-900/5 dark:border-stone-700/40 dark:bg-stone-900/20'
          : 'border-stone-200/60 bg-stone-900/10 dark:border-stone-700/40 dark:bg-stone-900/20',
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
        <div className="flex flex-wrap items-center gap-2">
          {label && (
            <span className="inline-flex shrink-0 rounded bg-stone-200 px-1.5 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-700 dark:text-stone-400">
              {label}
            </span>
          )}
          <InlineEditableText
            value={task.title}
            onSave={(title) => onRename!(task, title)}
            className={cn(
              'text-sm font-medium',
              task.completed
                ? 'text-stone-500 line-through dark:text-stone-400'
                : 'text-stone-900 dark:text-stone-100',
            )}
            disabled={!onRename || task.completed}
          />
        </div>
        {(task.recurrenceRule || isValidScheduledTime) && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {task.recurrenceRule && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Repeat className="h-3 w-3 shrink-0 text-violet-600 dark:text-violet-400" />
                {getRecurrenceLabel(task)}
              </span>
            )}
            {isValidScheduledTime && (
              <span>開始予定: {task.scheduledTime}</span>
            )}
          </div>
        )}
        {isDevMode && task.memo && (
          <div className="mt-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="memo" className="border-none">
                <AccordionTrigger className="py-1 text-xs text-muted-foreground hover:no-underline">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3 shrink-0" />
                    <span>メモ</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-0">
                  <div className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                    {task.memo}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>
      <div className="mt-0.5 flex items-center gap-2">
        {shouldShowDateDisplay && !task.completed && onUpdateExecutionDate && (
          <Popover open={isDateMenuOpen} onOpenChange={handleDateMenuOpenChange}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  'rounded-md px-2.5 py-1 text-sm font-medium transition-colors hover:opacity-80',
                  dateLabelStyle,
                )}
              >
                {dateLabel?.text ?? '未定'}
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
                    未定
                  </button>
                  <div className="my-1 h-px bg-stone-200 dark:bg-stone-700" />
                  <button
                    type="button"
                    className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
                    onClick={() => {
                      setCustomDateDraft(initialCustomDate)
                      setShowCalendar(true)
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    カレンダー
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomDateSubmit} className="space-y-2 p-2">
                  <Input
                    type="date"
                    value={customDateDraft ?? initialCustomDate}
                    onChange={(e) => setCustomDateDraft(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setShowCalendar(false)
                        setCustomDateDraft(null)
                      }}
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
        {shouldShowDateDisplay &&
          !task.completed &&
          !onUpdateExecutionDate &&
          dateLabel && (
            <span
              className={cn(
                'rounded-md px-2.5 py-1 text-sm font-medium',
                dateLabelStyle,
              )}
            >
              {dateLabel.text}
            </span>
          )}
        <div className="flex min-w-[40px] items-center justify-end">
          <EditDeleteDropdownMenu
            onEdit={
              !task.completed && onEdit ? () => onEdit(task) : undefined
            }
            onDelete={onDelete ? () => onDelete(task) : undefined}
            triggerClassName="opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
      </div>
    </div>
  )
}
