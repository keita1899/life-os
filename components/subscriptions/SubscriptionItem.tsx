'use client'

import { useMemo } from 'react'
import { MoreVertical, Pencil, Trash2, ExternalLink, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { getTodayDateString, getTomorrowDateString } from '@/lib/date/formats'
import { formatBillingCycle } from '@/lib/subscriptions'
import type { Subscription } from '@/lib/types/subscription'

interface SubscriptionItemProps {
  subscription: Subscription
  onEdit?: (subscription: Subscription) => void
  onDelete?: (subscription: Subscription) => void
  onToggleActive?: (subscription: Subscription) => void
}

export function SubscriptionItem({
  subscription,
  onEdit,
  onDelete,
  onToggleActive,
}: SubscriptionItemProps) {
  const formattedNextBillingDate = useMemo(() => {
    return format(new Date(subscription.nextBillingDate), 'yyyy年M月d日')
  }, [subscription.nextBillingDate])

  const isUpcoming = useMemo(() => {
    const today = getTodayDateString()
    const tomorrow = getTomorrowDateString()
    return (
      subscription.nextBillingDate === today ||
      subscription.nextBillingDate === tomorrow
    )
  }, [subscription.nextBillingDate])

  const billingCycleLabel = formatBillingCycle(subscription.billingCycle)

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border p-4',
        subscription.active
          ? 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900'
          : 'border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-950',
      )}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'text-sm font-medium',
              subscription.active
                ? 'text-stone-900 dark:text-stone-100'
                : 'text-stone-500 line-through dark:text-stone-400',
            )}
          >
            {subscription.name}
          </div>
          {!subscription.active && (
            <span className="rounded-md bg-stone-200 px-2 py-0.5 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-400">
              解約済
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            {subscription.monthlyPrice.toLocaleString()}円 / {billingCycleLabel}
          </span>
          <span
            className={cn(
              'rounded-md px-2.5 py-1 font-medium',
              isUpcoming
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
            )}
          >
            次回更新: {formattedNextBillingDate}
          </span>
          {subscription.cancellationUrl && (
            <a
              href={subscription.cancellationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              解約ページ
            </a>
          )}
        </div>
      </div>
      <div className="mt-0.5 flex items-center gap-2">
        {onToggleActive && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onToggleActive(subscription)}
            title={subscription.active ? '解約済にする' : '契約中にする'}
          >
            <Power
              className={cn(
                'h-4 w-4',
                subscription.active
                  ? 'text-green-500'
                  : 'text-stone-400',
              )}
            />
            <span className="sr-only">
              {subscription.active ? '解約済にする' : '契約中にする'}
            </span>
          </Button>
        )}
        <div className="flex min-w-[40px] items-center justify-end">
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
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(subscription)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>編集</span>
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(subscription)}
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
    </div>
  )
}
