'use client'

import { EventItem } from './EventItem'
import type { Event } from '@/lib/types/event'

interface EventListProps {
  events: Event[]
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
}

export function EventList({ events, onEdit, onDelete }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-stone-50/30 p-8 text-center dark:border-stone-800 dark:bg-stone-950/30">
        <p className="text-muted-foreground">予定がありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <EventItem
          key={event.id}
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
