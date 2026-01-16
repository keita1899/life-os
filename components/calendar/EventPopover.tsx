'use client'

import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  EVENT_CATEGORY_LABELS,
  EVENT_CATEGORY_COLORS,
} from '@/lib/events/constants'
import { EventDateTime } from '@/components/events/EventDateTime'
import type { Event } from '@/lib/types/event'

interface EventPopoverContentProps {
  event: Event
}

export function EventPopoverContent({ event }: EventPopoverContentProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          {event.title}
        </h3>
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        <EventDateTime event={event} />
        {event.allDay && (
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              終日
            </span>
          </div>
        )}
        {event.category && (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-md px-2 py-0.5',
                EVENT_CATEGORY_COLORS[event.category],
              )}
            >
              {EVENT_CATEGORY_LABELS[event.category]}
            </span>
          </div>
        )}
        {event.description && (
          <div className="pt-1">
            <p className="text-xs text-stone-600 dark:text-stone-400">
              {event.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
