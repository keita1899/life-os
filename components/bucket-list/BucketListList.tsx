'use client'

import { BucketListItem } from './BucketListItem'
import type { BucketListItem as BucketListItemType } from '@/lib/types/bucket-list-item'

interface BucketListListProps {
  items: BucketListItemType[]
  onEdit?: (item: BucketListItemType) => void
  onDelete?: (item: BucketListItemType) => void
  onToggleCompletion?: (item: BucketListItemType) => void
}

export function BucketListList({
  items,
  onEdit,
  onDelete,
  onToggleCompletion,
}: BucketListListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-8 text-center dark:border-stone-800 dark:bg-stone-950/30">
        <p className="text-muted-foreground">やりたいことがありません</p>
      </div>
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
        />
      ))}
    </div>
  )
}
