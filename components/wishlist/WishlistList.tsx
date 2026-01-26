'use client'

import { WishlistItem } from './WishlistItem'
import type { WishlistItem as WishlistItemType } from '@/lib/types/wishlist-item'

interface WishlistListProps {
  items: WishlistItemType[]
  onEdit?: (item: WishlistItemType) => void
  onDelete?: (item: WishlistItemType) => void
}

export function WishlistList({
  items,
  onEdit,
  onDelete,
}: WishlistListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-8 text-center dark:border-stone-800 dark:bg-stone-950/30">
        <p className="text-muted-foreground">欲しいものがありません</p>
      </div>
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
        />
      ))}
    </div>
  )
}
