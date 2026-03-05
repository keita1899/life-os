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
import { InsertIndicator } from '@/components/ui/insert-indicator'
import { DroppableGroup } from '@/components/ui/droppable-group'
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
  /** 親が DndContext を管理する場合のグループキー。指定時は DndContext を作らない */
  groupKey?: string
  /** このグループが現在ドロップ先としてハイライトされているか */
  isDropTarget?: boolean
  /** クロスグループ移動時、このタスクの前に挿入されることを示す ID */
  insertBeforeId?: number | null
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
  groupKey,
  isDropTarget = false,
  insertBeforeId,
}: TaskListProps) {
  const { sensors, handleDragEnd } = useSortableList({
    items: tasks,
    onReorder: onReorder ?? (async () => {}),
  })

  const renderTaskItems = (ghost: boolean) =>
    tasks.map((task) => (
      <div key={task.id}>
        {insertBeforeId === task.id && <InsertIndicator />}
        <SortableListItem id={task.id} ghostPlaceholder={ghost}>
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
      </div>
    ))

  // 親が DndContext を管理するモード（クロスグループ DnD）
  if (groupKey && onReorder) {
    return (
      <DroppableGroup groupKey={groupKey} isDropTarget={isDropTarget}>
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <EmptyState message="タスクがありません" />
            ) : (
              renderTaskItems(true)
            )}
          </div>
        </SortableContext>
      </DroppableGroup>
    )
  }

  if (tasks.length === 0) {
    return <EmptyState message="タスクがありません" />
  }

  // 自前 DndContext モード（他ページでの単体利用）
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
            {renderTaskItems(false)}
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
