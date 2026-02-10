'use client'

import { useMemo } from 'react'
import {
  CheckCircle2,
  Circle,
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
import type { WishlistItem as WishlistItemType } from '../types/wishlist-item'

interface WishlistItemProps {
  item: WishlistItemType
  onEdit?: (item: WishlistItemType) => void
  onDelete?: (item: WishlistItemType) => void
  onToggleCompletion?: (item: WishlistItemType) => void
}

export function WishlistItem({
  item,
  onEdit,
  onDelete,
  onToggleCompletion,
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
          <span
            className={cn(
              'text-sm font-medium',
              item.purchased
                ? 'text-stone-500 line-through dark:text-stone-400'
                : 'text-stone-900 dark:text-stone-100',
            )}
          >
            {item.name}
          </span>
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
            {!item.purchased && onEdit && (
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
