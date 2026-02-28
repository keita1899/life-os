'use client'

import { EmptyState } from '@/components/ui/empty-state'
import { SubscriptionItem } from './SubscriptionItem'
import type { Subscription } from '../types/subscription'

interface SubscriptionListProps {
  subscriptions: Subscription[]
  onEdit?: (subscription: Subscription) => void
  onDelete?: (subscription: Subscription) => void
  onToggleActive?: (subscription: Subscription) => void
  onRename?: (subscription: Subscription, name: string) => Promise<void>
}

export function SubscriptionList({
  subscriptions,
  onEdit,
  onDelete,
  onToggleActive,
  onRename,
}: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return <EmptyState message="サブスクリプションがありません" />
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
          onRename={onRename}
        />
      ))}
    </div>
  )
}
