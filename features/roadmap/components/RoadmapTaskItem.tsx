'use client'

import { useMemo } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import { SortableDragHandle } from '@/components/ui/sortable-list-item'
import { InlineEditableText } from '@/components/ui/inline-editable-text'
import { cn } from '@/lib/utils'
import type { RoadmapTask } from '../types/roadmap-task'

interface RoadmapTaskItemProps {
  task: RoadmapTask
  sectionName?: string
  onEdit?: (task: RoadmapTask) => void
  onDelete?: (task: RoadmapTask) => void
  onToggleCompletion?: (task: RoadmapTask) => void
  onRename?: (task: RoadmapTask, title: string) => Promise<void>
}

export function RoadmapTaskItem({
  task,
  sectionName,
  onEdit,
  onDelete,
  onToggleCompletion,
  onRename,
}: RoadmapTaskItemProps) {
  const yearLabel = useMemo(() => {
    if (task.targetYear == null) return null
    return `${task.targetYear}年`
  }, [task.targetYear])

  const monthLabel = useMemo(() => {
    if (task.targetMonth == null) return null
    return `${task.targetMonth}月`
  }, [task.targetMonth])

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border p-4',
        task.completed
          ? 'border-stone-200/60 bg-stone-900/5 dark:border-stone-700/40 dark:bg-stone-900/20'
          : 'border-stone-200/60 bg-stone-900/10 dark:border-stone-700/40 dark:bg-stone-900/20',
      )}
    >
      <SortableDragHandle />
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
        {(sectionName || yearLabel || monthLabel) && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {sectionName && (
              <span className="rounded-md bg-violet-100 px-2 py-1 dark:bg-violet-900/30">
                {sectionName}
              </span>
            )}
            {yearLabel && (
              <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
                {yearLabel}
              </span>
            )}
            {monthLabel && (
              <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
                {monthLabel}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="mt-0.5 flex items-center justify-end">
        <EditDeleteDropdownMenu
          onEdit={
            !task.completed && onEdit ? () => onEdit(task) : undefined
          }
          onDelete={onDelete ? () => onDelete(task) : undefined}
          triggerClassName="opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
    </div>
  )
}
