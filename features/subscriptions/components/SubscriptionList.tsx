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
import { SubscriptionItem } from './SubscriptionItem'
import type { Subscription } from '../types/subscription'

interface SubscriptionListProps {
  subscriptions: Subscription[]
  onEdit?: (subscription: Subscription) => void
  onDelete?: (subscription: Subscription) => void
  onToggleActive?: (subscription: Subscription) => void
  onRename?: (subscription: Subscription, name: string) => Promise<void>
  onReorder?: (updates: { id: number; order: number }[]) => Promise<void>
  /** 親が DndContext を管理する場合のグループキー */
  groupKey?: string
  /** このグループが現在ドロップ先としてハイライトされているか */
  isDropTarget?: boolean
  /** クロスグループ移動時、このアイテムの前に挿入されることを示す ID */
  insertBeforeId?: number | null
}

export function SubscriptionList({
  subscriptions,
  onEdit,
  onDelete,
  onToggleActive,
  onRename,
  onReorder,
  groupKey,
  isDropTarget: isDropTargetProp = false,
  insertBeforeId,
}: SubscriptionListProps) {
  const { sensors, handleDragEnd } = useSortableList({
    items: subscriptions,
    onReorder: onReorder ?? (async () => {}),
  })

  const renderItems = (ghost: boolean) =>
    subscriptions.map((subscription) => (
      <div key={subscription.id}>
        {insertBeforeId === subscription.id && <InsertIndicator />}
        <SortableListItem id={subscription.id} ghostPlaceholder={ghost}>
          <SubscriptionItem
            subscription={subscription}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            onRename={onRename}
          />
        </SortableListItem>
      </div>
    ))

  // 親が DndContext を管理するモード（クロスグループ DnD）
  if (groupKey && onReorder) {
    return (
      <DroppableGroup groupKey={groupKey} isDropTarget={isDropTargetProp}>
        <SortableContext
          items={subscriptions.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {subscriptions.length === 0 ? (
            <EmptyState message="サブスクリプションがありません" />
          ) : (
            <div className="space-y-2">
              {renderItems(true)}
            </div>
          )}
        </SortableContext>
      </DroppableGroup>
    )
  }

  if (subscriptions.length === 0) {
    return <EmptyState message="サブスクリプションがありません" />
  }

  if (onReorder) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={subscriptions.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {subscriptions.map((subscription) => (
              <SortableListItem key={subscription.id} id={subscription.id}>
                <SubscriptionItem
                  subscription={subscription}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleActive={onToggleActive}
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
      {subscriptions.map((subscription) => (
        <SubscriptionItem
          key={subscription.id}
          subscription={subscription}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          onRename={onRename}
        />
      ))}
    </div>
  )
}
