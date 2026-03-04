'use client'

import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { EmptyState } from '@/components/ui/empty-state'
import { SortableListItem } from '@/components/ui/sortable-list-item'
import { useSortableList } from '@/hooks/useSortableList'
import { TaskItem } from './TaskItem'
import type { Task } from '../types/task'

interface TaskListProps {
  tasks: Task[]
  getTaskLabel?: (task: Task) => string | undefined
  dateLabelMode?: 'all' | 'overdue-only'
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onToggleCompletion?: (task: Task) => void
  onUpdateExecutionDate?: (task: Task, executionDate: string | null) => void
  onRename?: (task: Task, title: string) => Promise<void>
  onReorder?: (updates: { id: number; order: number }[]) => Promise<void>
}

export function TaskList({
  tasks,
  getTaskLabel,
  dateLabelMode = 'all',
  onEdit,
  onDelete,
  onToggleCompletion,
  onUpdateExecutionDate,
  onRename,
  onReorder,
}: TaskListProps) {
  const { sensors, handleDragEnd } = useSortableList({
    items: tasks,
    onReorder: onReorder ?? (async () => {}),
  })

  if (tasks.length === 0) {
    return <EmptyState message="タスクがありません" />
  }

  if (onReorder) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tasks.map((task) => (
              <SortableListItem key={task.id} id={task.id}>
                <TaskItem
                  task={task}
                  label={getTaskLabel?.(task)}
                  dateLabelMode={dateLabelMode}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleCompletion={onToggleCompletion}
                  onUpdateExecutionDate={onUpdateExecutionDate}
                  onRename={onRename}
                />
              </SortableListItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          label={getTaskLabel?.(task)}
          dateLabelMode={dateLabelMode}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleCompletion={onToggleCompletion}
          onUpdateExecutionDate={onUpdateExecutionDate}
          onRename={onRename}
        />
      ))}
    </div>
  )
}
