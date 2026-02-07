'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LogEventItem } from '@/components/logs/LogEventItem'
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
        {events.length === 0 ? (
          <EmptyState message="予定がありません" />
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <LogEventItem
                key={`${event.id}-${event.startDatetime}`}
                event={event}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
