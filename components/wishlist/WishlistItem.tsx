'use client'

import { useMemo } from 'react'
import {
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { WishlistItem as WishlistItemType } from '@/lib/types/wishlist-item'

interface WishlistItemProps {
  item: WishlistItemType
  onEdit?: (item: WishlistItemType) => void
  onDelete?: (item: WishlistItemType) => void
}

export function WishlistItem({
  item,
  onEdit,
  onDelete,
}: WishlistItemProps) {
  const priceLabel = useMemo(() => {
    if (item.price === null) return null
    return `${item.price.toLocaleString()}円`
  }, [item.price])

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border p-4',
        'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900',
      )}
    >
      <div className="flex-1">
        <div
          className={cn(
            'text-sm font-medium',
            'text-stone-900 dark:text-stone-100',
          )}
        >
          {item.name}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {item.category && (
            <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
              {item.category.name}
            </span>
          )}
          {item.targetYear && (
            <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
              {item.targetYear}年
            </span>
          )}
          {priceLabel && (
            <span className="rounded-md bg-blue-100 px-2 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {priceLabel}
            </span>
          )}
        </div>
      </div>
      <div className="mt-0.5 flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">メニュー</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>編集</span>
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>削除</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
