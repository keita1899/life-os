'use client'

import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableListItem } from '@/components/ui/sortable-list-item'
import { useSortableList } from '@/hooks/useSortableList'
import { RoadmapTaskItem } from './RoadmapTaskItem'
import type { RoadmapTask } from '../types/roadmap-task'

interface RoadmapTaskListProps {
  tasks: RoadmapTask[]
  sectionNameMap?: Record<number, string>
  onEdit?: (task: RoadmapTask) => void
  onDelete?: (task: RoadmapTask) => void
  onToggleCompletion?: (task: RoadmapTask) => void
  onRename?: (task: RoadmapTask, title: string) => Promise<void>
  onReorder?: (updates: { id: number; order: number }[]) => Promise<void>
}

export function RoadmapTaskList({
  tasks,
  sectionNameMap,
  onEdit,
  onDelete,
  onToggleCompletion,
  onRename,
  onReorder,
}: RoadmapTaskListProps) {
  const { sensors, handleDragEnd } = useSortableList({
    items: tasks,
    onReorder: onReorder ?? (async () => {}),
  })

  if (onReorder) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tasks.map((task) => (
              <SortableListItem key={task.id} id={task.id}>
                <RoadmapTaskItem
                  task={task}
                  sectionName={task.sectionId != null ? sectionNameMap?.[task.sectionId] : undefined}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleCompletion={onToggleCompletion}
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
        <RoadmapTaskItem
          key={task.id}
          task={task}
          sectionName={task.sectionId != null ? sectionNameMap?.[task.sectionId] : undefined}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleCompletion={onToggleCompletion}
          onRename={onRename}
        />
      ))}
    </div>
  )
}
