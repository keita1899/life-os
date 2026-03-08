'use client'

import { useMemo, useState, useCallback } from 'react'
import { startOfDay, endOfDay } from 'date-fns'
import { useEvents, EventDialog, RecurringEventDeleteDialog } from '@/features/events'
import { expandRecurringEvents } from '@/features/events'
import { getEventsForDateSorted } from '@/features/logs'
import { LogEventsSection } from '@/features/logs'
import { EmptyState } from '@/components/ui/empty-state'
import type { Event, CreateEventInput } from '@/features/events'

interface MorningEventsStepProps {
  today: Date
}

export function MorningEventsStep({ today }: MorningEventsStepProps) {
  const { events: allEvents, updateEvent, deleteEvent } = useEvents()

  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null)

  const events = useMemo(() => {
    const rangeStart = startOfDay(today)
    const rangeEnd = endOfDay(today)
    const expanded = expandRecurringEvents(allEvents, rangeStart, rangeEnd)
    return getEventsForDateSorted(expanded, today)
  }, [allEvents, today])

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

  const handleRecurringDeleteConfirm = useCallback(async (deleteMode: 'single' | 'all') => {
    if (!deletingEvent) return
    if (deleteMode === 'all') {
      await deleteEvent(deletingEvent.id)
    } else {
      const excluded = [...(deletingEvent.recurrenceExcludedDates ?? []), deletingEvent.startDatetime?.split('T')[0]]
      await updateEvent(deletingEvent.id, { recurrenceExcludedDates: excluded.filter(Boolean) as string[] })
    }
    setDeletingEvent(null)
  }, [deletingEvent, updateEvent, deleteEvent])

  if (events.length === 0) {
    return (
      <div className="space-y-5">
        <EmptyState message="今日の予定はありません" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <LogEventsSection
        events={events}
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
          onConfirm={handleRecurringDeleteConfirm}
          onCancel={() => setDeletingEvent(null)}
        />
      )}
    </div>
  )
}
