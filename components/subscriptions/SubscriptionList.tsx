'use client'

import { SubscriptionItem } from './SubscriptionItem'
import type { Subscription } from '@/lib/types/subscription'

interface SubscriptionListProps {
  subscriptions: Subscription[]
  onEdit?: (subscription: Subscription) => void
  onDelete?: (subscription: Subscription) => void
  onToggleActive?: (subscription: Subscription) => void
}

export function SubscriptionList({
  subscriptions,
  onEdit,
  onDelete,
  onToggleActive,
}: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-8 text-center dark:border-stone-800 dark:bg-stone-950/30">
        <p className="text-muted-foreground">サブスクリプションがありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {subscriptions.map((subscription) => (
        <SubscriptionItem
          key={subscription.id}
          subscription={subscription}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  )
}
