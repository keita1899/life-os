'use client'

import { CreditCard, Pencil, Trash2 } from 'lucide-react'
import { formatDateDisplay } from '@/lib/date/formats'
import type { Subscription } from '@/lib/types/subscription'
import { Button } from '@/components/ui/button'

interface SubscriptionPopoverContentProps {
  subscription: Subscription
  onEdit?: (subscription: Subscription) => void
  onDelete?: (subscription: Subscription) => void
}

export function SubscriptionPopoverContent({
  subscription,
  onEdit,
  onDelete,
}: SubscriptionPopoverContentProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
          {subscription.name}
        </h3>
        {(onEdit || onDelete) && (
          <div className="flex shrink-0 items-center gap-1">
            {onEdit && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => onEdit(subscription)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">編集</span>
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(subscription)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">削除</span>
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <CreditCard className="h-3 w-3" />
          <span>更新日: {formatDateDisplay(subscription.nextBillingDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>月額: {subscription.monthlyPrice.toLocaleString()}円</span>
        </div>
      </div>
    </div>
  )
}
