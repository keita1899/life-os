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
import { InlineCreateButton } from '@/components/ui/inline-create-button'
import { SortableListItem } from '@/components/ui/sortable-list-item'
import { useSortableList } from '@/hooks/useSortableList'
import { TopicItemComponent } from './TopicItemComponent'
import type { TopicItem, UpdateTopicItemInput } from '../types/topic-item'

interface TopicListProps {
  items: TopicItem[]
  onEdit: (item: TopicItem) => void
  onDelete: (item: TopicItem) => void
  onUpdate: (id: number, input: UpdateTopicItemInput) => Promise<void>
  onCreate: () => void
  onReorder?: (updates: { id: number; order: number }[]) => Promise<void>
  groupKey?: string
  isDropTarget?: boolean
  insertBeforeId?: number | null
}

export function TopicList({
  items,
  onEdit,
  onDelete,
  onUpdate,
  onCreate,
  onReorder,
  groupKey,
  isDropTarget: isDropTargetProp = false,
  insertBeforeId,
}: TopicListProps) {
  const { sensors, handleDragEnd } = useSortableList({
    items,
    onReorder: onReorder ?? (async () => {}),
  })

  const renderItems = (ghost: boolean) =>
    items.map((item) => (
      <div key={item.id}>
        {insertBeforeId === item.id && <InsertIndicator />}
        <SortableListItem id={item.id} ghostPlaceholder={ghost}>
          <TopicItemComponent
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </SortableListItem>
      </div>
    ))

  if (groupKey && onReorder) {
    return (
      <div className="space-y-3">
        <DroppableGroup groupKey={groupKey} isDropTarget={isDropTargetProp}>
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.length === 0 ? (
              <EmptyState message="トピックがありません" />
            ) : (
              <div className="space-y-2">
                {renderItems(true)}
              </div>
            )}
          </SortableContext>
        </DroppableGroup>
        <InlineCreateButton label="トピックを追加" onClick={onCreate} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <EmptyState message="トピックがありません" />
      ) : onReorder ? (
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
                  <TopicItemComponent
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                  />
                </SortableListItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <TopicItemComponent
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
      <InlineCreateButton label="トピックを追加" onClick={onCreate} />
    </div>
  )
}
