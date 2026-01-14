'use client'

import { useMemo } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/types/task'

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const dateLabel = useMemo(() => {
    if (!task.executionDate) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayStr = format(today, 'yyyy-MM-dd')
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd')
    const taskDateStr = task.executionDate

    const taskDate = parseISO(taskDateStr)
    taskDate.setHours(0, 0, 0, 0)

    if (taskDateStr === todayStr) {
      return { text: '今日', type: 'today' as const }
    }
    if (taskDateStr === tomorrowStr) {
      return { text: '明日', type: 'tomorrow' as const }
    }
    if (taskDate < today) {
      return { text: '期限切れ', type: 'overdue' as const }
    }

    const dateText = format(taskDate, 'M/d(E)', { locale: ja })
    return { text: dateText, type: 'future' as const }
  }, [task.executionDate])

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        task.completed
          ? 'border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-950'
          : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900',
      )}
    >
      <div className="mt-0.5">
        {task.completed ? (
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
      {dateLabel && (
        <div className="mt-0.5">
          <span
            className={cn(
              'rounded-md px-2.5 py-1 text-sm font-medium',
              dateLabel.type === 'today' &&
                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
              dateLabel.type === 'tomorrow' &&
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
              dateLabel.type === 'overdue' &&
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
              dateLabel.type === 'future' &&
                'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
            )}
          >
            {dateLabel.text}
          </span>
        </div>
      )}
    </div>
  )
}
