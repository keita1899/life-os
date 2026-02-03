'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EventList } from '@/components/events/EventList'
import type { Event } from '@/lib/types/event'

interface LogEventsSectionProps {
  events: Event[]
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
}

export function LogEventsSection({
  events,
  onEdit,
  onDelete,
}: LogEventsSectionProps) {
  return (
    <Card className="border-stone-200/60 dark:border-stone-700/40">
      <CardHeader>
        <CardTitle className="text-lg">予定</CardTitle>
      </CardHeader>
      <CardContent>
        <EventList events={events} onEdit={onEdit} onDelete={onDelete} />
      </CardContent>
    </Card>
  )
}
