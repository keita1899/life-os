'use client'

import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { formatDateDisplay } from '@/lib/date/formats'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { Subscription } from '@/features/subscriptions'

interface SubscriptionPopoverContentProps {
  subscription: Subscription
}

export function SubscriptionPopoverContent({
  subscription,
}: SubscriptionPopoverContentProps) {
  return (
    <div className="space-y-3">
      <h3 className="min-w-0 text-sm font-semibold text-stone-900 dark:text-stone-100">
        {subscription.name}
      </h3>
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

const TRIGGER_CLASS = {
  month: 'truncate px-1 py-0.5',
  week: 'px-2 py-1.5',
} as const

const LABEL_CLASS = {
  month: 'truncate',
  week: 'font-medium line-clamp-2',
} as const

interface SubscriptionPopoverWrapperProps {
  subscription: Subscription
  variant: 'month' | 'week'
  onOpenChange?: (open: boolean) => void
}

export function SubscriptionPopoverWrapper({
  subscription,
  variant,
  onOpenChange,
}: SubscriptionPopoverWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex w-full items-center gap-1 rounded border text-left text-xs hover:opacity-80',
            TRIGGER_CLASS[variant],
            'border-purple-200/60 bg-purple-50/50 text-purple-900 dark:border-purple-800/40 dark:bg-purple-950/20 dark:text-purple-100',
          )}
          title={subscription.name}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <CreditCard className="h-3 w-3 shrink-0 text-purple-600 dark:text-purple-400" />
          <span className={cn('min-w-0 flex-1', LABEL_CLASS[variant])}>
            更新日 {subscription.name}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <SubscriptionPopoverContent subscription={subscription} />
      </PopoverContent>
    </Popover>
  )
}
