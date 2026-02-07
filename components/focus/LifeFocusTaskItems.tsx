'use client'

import { GripVertical, X } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import type { Task } from '@/lib/types/task'

interface SortableTaskItemProps {
  task: Task
  index: number
  onToggle: () => void
  onRemove: () => void
}

export function SortableTaskItem({
  task,
  index,
  onToggle,
  onRemove,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-primary bg-primary/5 p-4 dark:border-primary dark:bg-primary/10"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <input
        type="checkbox"
        checked={true}
        onChange={onToggle}
        className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary"
      />
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm font-medium text-muted-foreground">
          {index + 1}.
        </span>
        <div className="flex-1 font-medium">{task.title}</div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-8 w-8"
        aria-label="フォーカスから削除"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface DraggableAvailableTaskItemProps {
  task: Task
  onToggle: () => void
}

export function DraggableAvailableTaskItem({
  task,
  onToggle,
}: DraggableAvailableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-stone-200 bg-card p-4 dark:border-stone-800"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <input
        type="checkbox"
        checked={false}
        onChange={onToggle}
        className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary"
      />
      <div className="flex-1 font-medium">{task.title}</div>
    </div>
  )
}
