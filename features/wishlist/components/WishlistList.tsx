'use client'

import { EmptyState } from '@/components/ui/empty-state'
import { WishlistItem } from './WishlistItem'
import type { WishlistItem as WishlistItemType } from '../types/wishlist-item'

interface WishlistListProps {
  items: WishlistItemType[]
  onEdit?: (item: WishlistItemType) => void
  onDelete?: (item: WishlistItemType) => void
  onToggleCompletion?: (item: WishlistItemType) => void
}

export function WishlistList({
  items,
  onEdit,
  onDelete,
  onToggleCompletion,
}: WishlistListProps) {
  if (items.length === 0) {
    return <EmptyState message="欲しいものがありません" />
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
        />
      ))}
    </div>
  )
}
