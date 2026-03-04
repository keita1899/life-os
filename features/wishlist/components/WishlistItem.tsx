'use client'

import { useMemo } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import { SortableDragHandle } from '@/components/ui/sortable-list-item'
import { cn } from '@/lib/utils'
import { InlineEditableText } from '@/components/ui/inline-editable-text'
import type { WishlistItem as WishlistItemType } from '../types/wishlist-item'

interface WishlistItemProps {
  item: WishlistItemType
  onEdit?: (item: WishlistItemType) => void
  onDelete?: (item: WishlistItemType) => void
  onToggleCompletion?: (item: WishlistItemType) => void
  onRename?: (item: WishlistItemType, name: string) => Promise<void>
}

export function WishlistItem({
  item,
  onEdit,
  onDelete,
  onToggleCompletion,
  onRename,
}: WishlistItemProps) {
  const priceLabel = useMemo(() => {
    if (item.price === null) return null
    return `${item.price.toLocaleString()}円`
  }, [item.price])

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border p-4',
        item.purchased
          ? 'border-stone-200/60 bg-stone-900/5 dark:border-stone-700/40 dark:bg-stone-900/20'
          : 'border-stone-200/60 bg-stone-900/10 dark:border-stone-700/40 dark:bg-stone-900/20',
      )}
    >
      <SortableDragHandle />
      <div className="mt-0.5">
        {onToggleCompletion ? (
          <button
            type="button"
            onClick={() => onToggleCompletion(item)}
            className="focus:outline-none"
          >
            {item.purchased ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-stone-400" />
            )}
          </button>
        ) : item.purchased ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5 text-stone-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <InlineEditableText
            value={item.name}
            onSave={(name) => onRename!(item, name)}
            className={cn(
              'text-sm font-medium',
              item.purchased
                ? 'text-stone-500 line-through dark:text-stone-400'
                : 'text-stone-900 dark:text-stone-100',
            )}
            disabled={!onRename || item.purchased}
          />
          {priceLabel && (
            <span className="text-sm text-muted-foreground shrink-0">
              {priceLabel}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {item.category && (
            <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
              {item.category.name}
            </span>
          )}
          {item.targetYear != null && (
            <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
              {item.targetYear}年
            </span>
          )}
          {item.targetMonth != null && (
            <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
              {item.targetMonth}月
            </span>
          )}
        </div>
      </div>
      <div className="mt-0.5 flex items-center justify-end">
        <EditDeleteDropdownMenu
          onEdit={
            !item.purchased && onEdit ? () => onEdit(item) : undefined
          }
          onDelete={onDelete ? () => onDelete(item) : undefined}
          triggerClassName="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        />
      </div>
    </div>
  )
}
