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
import { SubscriptionItem } from './SubscriptionItem'
import type { Subscription } from '../types/subscription'

interface SubscriptionListProps {
  subscriptions: Subscription[]
  onEdit?: (subscription: Subscription) => void
  onDelete?: (subscription: Subscription) => void
  onToggleActive?: (subscription: Subscription) => void
  onRename?: (subscription: Subscription, name: string) => Promise<void>
  onReorder?: (updates: { id: number; order: number }[]) => Promise<void>
}

export function SubscriptionList({
  subscriptions,
  onEdit,
  onDelete,
  onToggleActive,
  onRename,
  onReorder,
}: SubscriptionListProps) {
  const { sensors, handleDragEnd } = useSortableList({
    items: subscriptions,
    onReorder: onReorder ?? (async () => {}),
  })

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
