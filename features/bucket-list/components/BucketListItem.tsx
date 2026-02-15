'use client'

import { useMemo } from 'react'
import {
  CheckCircle2,
  Circle,
  Calendar,
  CheckSquare,
} from 'lucide-react'
import {
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { EditDeleteDropdownMenu } from '@/components/ui/edit-delete-dropdown-menu'
import { cn } from '@/lib/utils'
import { calculateAgeAtYear } from '../lib/age-calculation'
import { useUserSettings } from '@/features/settings'
import type { BucketListItem as BucketListItemType } from '../types/bucket-list-item'

interface BucketListItemProps {
  item: BucketListItemType
  onEdit?: (item: BucketListItemType) => void
  onDelete?: (item: BucketListItemType) => void
  onToggleCompletion?: (item: BucketListItemType) => void
  onConvertToEvent?: (item: BucketListItemType) => void
  onConvertToTask?: (item: BucketListItemType) => void
}

export function BucketListItem({
  item,
  onEdit,
  onDelete,
  onToggleCompletion,
  onConvertToEvent,
  onConvertToTask,
}: BucketListItemProps) {
  const { userSettings } = useUserSettings()
  const birthday = userSettings?.birthday ?? null

  const yearLabel = useMemo(() => {
    if (item.targetYear == null) return null
    if (!birthday) return `${item.targetYear}年`
    const age = calculateAgeAtYear(
      birthday,
      item.targetYear,
      item.targetMonth ?? null,
    )
    return age !== null ? `${item.targetYear}年（${age}歳）` : `${item.targetYear}年`
  }, [birthday, item.targetYear, item.targetMonth])

  const monthLabel = useMemo(() => {
    if (item.targetMonth == null) return null
    return `${item.targetMonth}月`
  }, [item.targetMonth])

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
          {yearLabel && (
            <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
              {yearLabel}
            </span>
          )}
          {monthLabel && (
            <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
              {monthLabel}
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
        <EditDeleteDropdownMenu
          onEdit={
            !item.completed && onEdit ? () => onEdit(item) : undefined
          }
          onDelete={onDelete ? () => onDelete(item) : undefined}
          triggerClassName="opacity-0 transition-opacity group-hover:opacity-100"
        >
          {!item.completed && onConvertToEvent && (
            <DropdownMenuItem onClick={() => onConvertToEvent(item)}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>予定に変換</span>
            </DropdownMenuItem>
          )}
          {!item.completed && onConvertToTask && (
            <DropdownMenuItem onClick={() => onConvertToTask(item)}>
              <CheckSquare className="mr-2 h-4 w-4" />
              <span>タスクに変換</span>
            </DropdownMenuItem>
          )}
        </EditDeleteDropdownMenu>
      </div>
    </div>
  )
}
