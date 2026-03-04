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
import { BucketListItem } from './BucketListItem'
import type { BucketListItem as BucketListItemType } from '../types/bucket-list-item'

interface BucketListListProps {
  items: BucketListItemType[]
  onEdit?: (item: BucketListItemType) => void
  onDelete?: (item: BucketListItemType) => void
  onToggleCompletion?: (item: BucketListItemType) => void
  onConvertToEvent?: (item: BucketListItemType) => void
  onConvertToTask?: (item: BucketListItemType) => void
  onRename?: (item: BucketListItemType, title: string) => Promise<void>
  onReorder?: (updates: { id: number; order: number }[]) => Promise<void>
}

export function BucketListList({
  items,
  onEdit,
  onDelete,
  onToggleCompletion,
  onConvertToEvent,
  onConvertToTask,
  onRename,
  onReorder,
}: BucketListListProps) {
  const { sensors, handleDragEnd } = useSortableList({
    items,
    onReorder: onReorder ?? (async () => {}),
  })

  if (items.length === 0) {
    return <EmptyState message="やりたいことがありません" />
  }

  if (onReorder) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((item) => (
              <SortableListItem key={item.id} id={item.id}>
                <BucketListItem
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleCompletion={onToggleCompletion}
                  onConvertToEvent={onConvertToEvent}
                  onConvertToTask={onConvertToTask}
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
      {items.map((item) => (
        <BucketListItem
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleCompletion={onToggleCompletion}
          onConvertToEvent={onConvertToEvent}
          onConvertToTask={onConvertToTask}
          onRename={onRename}
        />
      ))}
    </div>
  )
}
