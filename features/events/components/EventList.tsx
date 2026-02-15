'use client'

import { EmptyState } from '@/components/ui/empty-state'
import { EventItem } from './EventItem'
import type { Event } from '../types/event'

interface EventListProps {
  events: Event[]
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
}

export function EventList({ events, onEdit, onDelete }: EventListProps) {
  if (events.length === 0) {
    return <EmptyState message="予定がありません" />
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <EventItem
          key={`${event.id}-${event.startDatetime}`}
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
