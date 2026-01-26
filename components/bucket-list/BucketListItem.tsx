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
import { calculateAgeAtYear } from '@/lib/bucket-list/age-calculation'
import { useUserSettings } from '@/hooks/useUserSettings'
import type { BucketListItem as BucketListItemType } from '@/lib/types/bucket-list-item'

interface BucketListItemProps {
  item: BucketListItemType
  onEdit?: (item: BucketListItemType) => void
  onDelete?: (item: BucketListItemType) => void
  onToggleCompletion?: (item: BucketListItemType) => void
}

export function BucketListItem({
  item,
  onEdit,
  onDelete,
  onToggleCompletion,
}: BucketListItemProps) {
  const { userSettings } = useUserSettings()
  const birthday = userSettings?.birthday ?? null

  const ageInfo = useMemo(() => {
    if (!item.targetYear || !birthday) return null
    const age = calculateAgeAtYear(birthday, item.targetYear)
    return age !== null ? `${item.targetYear}年（${age}歳）` : `${item.targetYear}年`
  }, [birthday, item.targetYear])

  const achievedDateLabel = useMemo(() => {
    if (!item.achievedDate) return null
    const date = new Date(item.achievedDate)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [item.achievedDate])

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border p-4',
        item.completed
          ? 'border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-950'
          : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900',
      )}
    >
      <div className="mt-0.5">
        {onToggleCompletion ? (
          <button
            type="button"
            onClick={() => onToggleCompletion(item)}
            className="focus:outline-none"
          >
            {item.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-stone-400" />
            )}
          </button>
        ) : item.completed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5 text-stone-400" />
        )}
      </div>
      <div className="flex-1">
        <div
          className={cn(
            'text-sm font-medium',
            item.completed
              ? 'text-stone-500 line-through dark:text-stone-400'
              : 'text-stone-900 dark:text-stone-100',
          )}
        >
          {item.title}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {item.category && (
            <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
              {item.category.name}
            </span>
          )}
          {ageInfo && (
            <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
              {ageInfo}
            </span>
          )}
          {achievedDateLabel && (
            <span className="rounded-md bg-green-100 px-2 py-1 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              達成日: {achievedDateLabel}
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
              className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">メニュー</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!item.completed && onEdit && (
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
