'use client'

import { useMemo, useState, useCallback } from 'react'
import { addDays, startOfDay, endOfDay } from 'date-fns'
import { useEvents, EventDialog, RecurringEventDeleteDialog } from '@/features/events'
import { expandRecurringEvents } from '@/features/events'
import { getEventsForDateSorted } from '@/features/logs'
import { LogEventsSection } from '@/features/logs'
import type { Event, CreateEventInput } from '@/features/events'

interface EveningTomorrowEventsStepProps {
  today: Date
}

export function EveningTomorrowEventsStep({ today }: EveningTomorrowEventsStepProps) {
  const tomorrow = useMemo(() => addDays(today, 1), [today])

  const { events: allEvents, updateEvent, deleteEvent } = useEvents()

  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null)

  const lifeEvents = useMemo(() => {
    const rangeStart = startOfDay(tomorrow)
    const rangeEnd = endOfDay(tomorrow)
    const expanded = expandRecurringEvents(allEvents, rangeStart, rangeEnd)
    return getEventsForDateSorted(expanded, tomorrow)
  }, [allEvents, tomorrow])

  const handleEditEvent = useCallback((event: Event) => {
    setEditingEvent(event)
  }, [])

  const handleEditEventSubmit = useCallback(async (input: CreateEventInput) => {
    if (!editingEvent) return
    await updateEvent(editingEvent.id, input)
    setEditingEvent(null)
  }, [editingEvent, updateEvent])

  const handleDeleteEvent = useCallback((event: Event) => {
    if (event.recurrenceRule) {
      setDeletingEvent(event)
    } else {
      void deleteEvent(event.id)
    }
  }, [deleteEvent])

  const handleRecurringEventDeleteConfirm = useCallback(async (deleteMode: 'single' | 'all') => {
    if (!deletingEvent) return
    if (deleteMode === 'all') {
      await deleteEvent(deletingEvent.id)
    } else {
      const excluded = [...(deletingEvent.recurrenceExcludedDates ?? []), deletingEvent.startDatetime?.split('T')[0]]
      await updateEvent(deletingEvent.id, { recurrenceExcludedDates: excluded.filter(Boolean) as string[] })
    }
    setDeletingEvent(null)
  }, [deletingEvent, updateEvent, deleteEvent])

  return (
    <div className="space-y-5">
      <LogEventsSection
        events={lifeEvents}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
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
          onConfirm={handleRecurringEventDeleteConfirm}
          onCancel={() => setDeletingEvent(null)}
        />
      )}
    </div>
  )
}
