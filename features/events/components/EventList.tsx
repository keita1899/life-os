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
import { EventItem } from './EventItem'
import type { Event } from '../types/event'

interface EventListProps {
  events: Event[]
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
  onRename?: (event: Event, title: string) => Promise<void>
  onReorder?: (updates: { id: number; order: number }[]) => Promise<void>
  /** 親が DndContext を管理する場合のグループキー。指定時は DndContext を作らない */
  groupKey?: string
  /** このグループが現在ドロップ先としてハイライトされているか */
  isDropTarget?: boolean
  /** クロスグループ移動時、このアイテムの前に挿入されることを示す ID */
  insertBeforeId?: number | null
}

export function EventList({
  events,
  onEdit,
  onDelete,
  onRename,
  onReorder,
  groupKey,
  isDropTarget = false,
  insertBeforeId,
}: EventListProps) {
  const { sensors, handleDragEnd } = useSortableList({
    items: events,
    onReorder: onReorder ?? (async () => {}),
  })

  const renderEventItems = (ghost: boolean) =>
    events.map((event) => {
      const key = `${event.id}-${event.startDatetime}`
      return (
        <div key={key}>
          {insertBeforeId === event.id && <InsertIndicator />}
          <SortableListItem id={event.id} ghostPlaceholder={ghost}>
            <EventItem
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
              onRename={onRename}
              showDragHandle
            />
          </SortableListItem>
        </div>
      )
    })

  // 親が DndContext を管理するモード（クロスグループ DnD）
  if (groupKey && onReorder) {
    return (
      <DroppableGroup groupKey={groupKey} isDropTarget={isDropTarget}>
        <SortableContext
          items={events.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {events.length === 0 ? (
              <EmptyState message="予定がありません" />
            ) : (
              renderEventItems(true)
            )}
          </div>
        </SortableContext>
      </DroppableGroup>
    )
  }

  if (events.length === 0) {
    return <EmptyState message="予定がありません" />
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
          items={events.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {renderEventItems(false)}
          </div>
        </SortableContext>
      </DndContext>
    )
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <EventItem
          key={`${event.id}-${event.startDatetime}`}
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  )
}
