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
import { InterviewItemComponent } from './InterviewItemComponent'
import type { InterviewItem, UpdateInterviewItemInput } from '../types/interview-item'

interface InterviewListProps {
  items: InterviewItem[]
  onEdit: (item: InterviewItem) => void
  onDelete: (item: InterviewItem) => void
  onUpdate: (id: number, input: UpdateInterviewItemInput) => Promise<void>
  onCreate: () => void
  onReorder?: (updates: { id: number; order: number }[]) => Promise<void>
  /** 親が DndContext を管理する場合のグループキー */
  groupKey?: string
  /** このグループが現在ドロップ先としてハイライトされているか */
  isDropTarget?: boolean
  /** クロスグループ移動時、このアイテムの前に挿入されることを示す ID */
  insertBeforeId?: number | null
}

export function InterviewList({
  items,
  onEdit,
  onDelete,
  onUpdate,
  onCreate,
  onReorder,
  groupKey,
  isDropTarget: isDropTargetProp = false,
  insertBeforeId,
}: InterviewListProps) {
  const { sensors, handleDragEnd } = useSortableList({
    items,
    onReorder: onReorder ?? (async () => {}),
  })

  const renderItems = (ghost: boolean) =>
    items.map((item) => (
      <div key={item.id}>
        {insertBeforeId === item.id && <InsertIndicator />}
        <SortableListItem id={item.id} ghostPlaceholder={ghost}>
          <InterviewItemComponent
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </SortableListItem>
      </div>
    ))

  // 親が DndContext を管理するモード（クロスグループ DnD）
  if (groupKey && onReorder) {
    return (
      <div className="space-y-3">
        <DroppableGroup groupKey={groupKey} isDropTarget={isDropTargetProp}>
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.length === 0 ? (
              <EmptyState message="Q&Aがありません" />
            ) : (
              <div className="space-y-2">
                {renderItems(true)}
              </div>
            )}
          </SortableContext>
        </DroppableGroup>
        <InlineCreateButton label="Q&Aを追加" onClick={onCreate} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <EmptyState message="Q&Aがありません" />
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
                  <InterviewItemComponent
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
            <InterviewItemComponent
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
      <InlineCreateButton label="Q&Aを追加" onClick={onCreate} />
    </div>
  )
}
