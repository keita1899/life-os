'use client'

import { EmptyState } from '@/components/ui/empty-state'
import { BucketListItem } from './BucketListItem'
import type { BucketListItem as BucketListItemType } from '../types/bucket-list-item'

interface BucketListListProps {
  items: BucketListItemType[]
  onEdit?: (item: BucketListItemType) => void
  onDelete?: (item: BucketListItemType) => void
  onToggleCompletion?: (item: BucketListItemType) => void
  onConvertToEvent?: (item: BucketListItemType) => void
  onConvertToTask?: (item: BucketListItemType) => void
}

export function BucketListList({
  items,
  onEdit,
  onDelete,
  onToggleCompletion,
  onConvertToEvent,
  onConvertToTask,
}: BucketListListProps) {
  if (items.length === 0) {
    return <EmptyState message="やりたいことがありません" />
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
        />
      ))}
    </div>
  )
}
