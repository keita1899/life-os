'use client'

import { useMemo, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { useEvents, EventDialog, RecurringEventDeleteDialog, expandRecurringEvents } from '@/features/events'
import { getEventsForDateSorted } from '@/features/logs'
import { getWeekDays } from '@/features/calendar'
import { EmptyState } from '@/components/ui/empty-state'
import { LogEventItem } from '@/features/logs'
import type { Event, CreateEventInput } from '@/features/events'

interface WeekStartEventsStepProps {
  weekStartDate: Date
  weekStartDay: number
}

export function WeekStartEventsStep({
  weekStartDate,
  weekStartDay,
}: WeekStartEventsStepProps) {
  const { events: allEvents, updateEvent, deleteEvent } = useEvents()

  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null)

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

  const handleEditEvent = useCallback((event: Event) => {
    setEditingEvent(event)
  }, [])

  const handleEditEventSubmit = useCallback(async (input: CreateEventInput) => {
    if (!editingEvent) return
    try {
      await updateEvent(editingEvent.id, input)
      setEditingEvent(null)
    } catch (err) {
      console.error('Failed to update event:', err)
    }
  }, [editingEvent, updateEvent])

  const handleDeleteEvent = useCallback(async (event: Event) => {
    if (event.recurrenceRule) {
      setDeletingEvent(event)
    } else {
      try {
        await deleteEvent(event.id)
      } catch (err) {
        console.error('Failed to delete event:', err)
      }
    }
  }, [deleteEvent])

  const handleRecurringDeleteConfirm = useCallback(async (deleteMode: 'single' | 'all') => {
    if (!deletingEvent) return
    try {
      if (deleteMode === 'all') {
        await deleteEvent(deletingEvent.id)
      } else {
        const excluded = [...(deletingEvent.recurrenceExcludedDates ?? []), deletingEvent.startDatetime?.split('T')[0]]
          .filter((d): d is string => Boolean(d))
        await updateEvent(deletingEvent.id, { recurrenceExcludedDates: excluded })
      }
    } catch (err) {
      console.error('Failed to delete recurring event:', err)
    } finally {
      setDeletingEvent(null)
    }
  }, [deletingEvent, updateEvent, deleteEvent])

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
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                />
              ))}
            </div>
          </div>
        ),
      )}
      <EventDialog
        open={!!editingEvent}
        onOpenChange={(open) => !open && setEditingEvent(null)}
        onSubmit={handleEditEventSubmit}
        event={editingEvent ?? undefined}
      />
      {deletingEvent && (
        <RecurringEventDeleteDialog
          open={!!deletingEvent}
          eventTitle={deletingEvent.title}
          onConfirm={handleRecurringDeleteConfirm}
          onCancel={() => setDeletingEvent(null)}
        />
      )}
    </div>
  )
}
