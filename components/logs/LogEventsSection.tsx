'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EventList } from '@/components/events/EventList'
import type { Event } from '@/lib/types/event'

interface LogEventsSectionProps {
  events: Event[]
}

export function LogEventsSection({ events }: LogEventsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">予定</CardTitle>
      </CardHeader>
      <CardContent>
        <EventList events={events} />
      </CardContent>
    </Card>
  )
}
