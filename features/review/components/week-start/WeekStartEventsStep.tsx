'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { useEvents, expandRecurringEvents } from '@/features/events'
import { getEventsForDateSorted } from '@/features/logs'
import { getWeekDays } from '@/features/calendar'
import { EmptyState } from '@/components/ui/empty-state'
import { LogEventItem } from '@/features/logs'

interface WeekStartEventsStepProps {
  weekStartDate: Date
  weekStartDay: number
}

export function WeekStartEventsStep({
  weekStartDate,
  weekStartDay,
}: WeekStartEventsStepProps) {
  const { events: allEvents } = useEvents()

  const weekDays = useMemo(
    () => getWeekDays(weekStartDate, weekStartDay),
    [weekStartDate, weekStartDay],
  )

  const eventsByDay = useMemo(() => {
    if (weekDays.length === 0) return []
    const rangeStart = new Date(weekDays[0])
    rangeStart.setHours(0, 0, 0, 0)
    const rangeEnd = new Date(weekDays[weekDays.length - 1])
    rangeEnd.setHours(23, 59, 59, 999)
    const expanded = expandRecurringEvents(allEvents, rangeStart, rangeEnd)
    return weekDays.map((day) => ({
      day,
      events: getEventsForDateSorted(expanded, day),
    }))
  }, [allEvents, weekDays])

  const hasAny = eventsByDay.some((d) => d.events.length > 0)

  if (!hasAny) {
    return <EmptyState message="今週の予定がありません" />
  }

  return (
    <div className="space-y-5">
      {eventsByDay.map(({ day, events }) =>
        events.length === 0 ? null : (
          <div key={format(day, 'yyyy-MM-dd')} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {format(day, 'M/d(E)', { locale: ja })}
            </h3>
            <div className="space-y-2">
              {events.map((event) => (
                <LogEventItem
                  key={`${event.id}-${event.startDatetime}`}
                  event={event}
                />
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  )
}
