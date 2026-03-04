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
import { WishlistItem } from './WishlistItem'
import type { WishlistItem as WishlistItemType } from '../types/wishlist-item'

interface WishlistListProps {
  items: WishlistItemType[]
  onEdit?: (item: WishlistItemType) => void
  onDelete?: (item: WishlistItemType) => void
  onToggleCompletion?: (item: WishlistItemType) => void
  onRename?: (item: WishlistItemType, name: string) => Promise<void>
  onReorder?: (updates: { id: number; order: number }[]) => Promise<void>
}

export function WishlistList({
  items,
  onEdit,
  onDelete,
  onToggleCompletion,
  onRename,
  onReorder,
}: WishlistListProps) {
  const { sensors, handleDragEnd } = useSortableList({
    items,
    onReorder: onReorder ?? (async () => {}),
  })

  if (items.length === 0) {
    return <EmptyState message="欲しいものがありません" />
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
                <WishlistItem
                  item={item}
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
      {items.map((item) => (
        <WishlistItem
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleCompletion={onToggleCompletion}
          onRename={onRename}
        />
      ))}
    </div>
  )
}
