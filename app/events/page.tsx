'use client'

import { useState, useMemo, useCallback } from 'react'
import { startOfDay, subYears, addMonths } from 'date-fns'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { EventList } from '@/components/events/EventList'
import { EventDialog } from '@/components/events/EventDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { RecurringEventDeleteDialog } from '@/components/events/RecurringEventDeleteDialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { useEvents } from '@/hooks/useEvents'
import { useMode } from '@/lib/contexts/ModeContext'
import { expandRecurringEvents } from '@/lib/events'
import { groupEvents } from '@/lib/events/grouping'
import type {
  CreateEventInput,
  Event,
  UpdateEventInput,
} from '@/lib/types/event'

export default function EventsPage() {
  const { mode } = useMode()
  const { events, isLoading, error, createEvent, updateEvent, deleteEvent } =
    useEvents()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined)
  const [deletingEvent, setDeletingEvent] = useState<Event | undefined>(
    undefined,
  )
  const [operationError, setOperationError] = useState<string | null>(null)

  const expandedEvents = useMemo(() => {
    const today = new Date()
    const rangeStart = startOfDay(subYears(today, 1))
    const rangeEnd = addMonths(today, 1)
    return expandRecurringEvents(events, rangeStart, rangeEnd)
  }, [events])

  const groupedEvents = useMemo(() => groupEvents(expandedEvents), [expandedEvents])

  const visibleGroups = useMemo(
    () =>
      groupedEvents.filter(
        (group) => group.key === 'today' || group.events.length > 0,
      ),
    [groupedEvents],
  )

  const handleCreateEvent = async (input: CreateEventInput) => {
    try {
      setOperationError(null)
      await createEvent(input)
      setIsDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '予定の作成に失敗しました',
      )
    }
  }

  const handleUpdateEvent = async (input: CreateEventInput) => {
    if (!editingEvent) return

    try {
      setOperationError(null)
      const updateInput: UpdateEventInput = {
        title: input.title,
        startDatetime: input.startDatetime,
        endDatetime: input.endDatetime,
        allDay: input.allDay,
        category: input.category,
        description: input.description,
        recurrenceRule: input.recurrenceRule,
        recurrenceDaysOfWeek: input.recurrenceDaysOfWeek,
        recurrenceDayOfMonth: input.recurrenceDayOfMonth,
        recurrenceEndDate: input.recurrenceEndDate,
      }
      await updateEvent(editingEvent.id, updateInput)
      setIsDialogOpen(false)
      setEditingEvent(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '予定の更新に失敗しました',
      )
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setIsDialogOpen(true)
  }

  const handleDeleteEvent = async (mode?: 'single' | 'all') => {
    if (!deletingEvent) return

    try {
      setOperationError(null)
      if (deletingEvent.recurrenceRule && mode === 'single' && deletingEvent.startDatetime) {
        const eventDate = deletingEvent.startDatetime.split('T')[0]
        const currentExcludedDates = deletingEvent.recurrenceExcludedDates || []
        if (!currentExcludedDates.includes(eventDate)) {
          await updateEvent(deletingEvent.id, {
            recurrenceExcludedDates: [...currentExcludedDates, eventDate],
          })
        }
      } else {
        await deleteEvent(deletingEvent.id)
      }
      setDeletingEvent(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '予定の削除に失敗しました',
      )
    }
  }

  const handleDeleteClick = (event: Event) => {
    setDeletingEvent(event)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingEvent(undefined)
    }
  }

  const handleCreateClick = useCallback(() => {
    setEditingEvent(undefined)
    setIsDialogOpen(true)
  }, [])

  useCreateShortcut({
    onCreate: handleCreateClick,
    enabled: !isDialogOpen,
  })

  if (mode !== 'life') {
    return null
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">予定</h1>
            </div>
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              予定を作成
            </Button>
          </div>
        </div>

      <ErrorMessage
        message={operationError || error || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={visibleGroups.map((group) => group.key)}
        >
          {visibleGroups.map((group) => (
            <AccordionItem key={group.key} value={group.key}>
              <AccordionHeader>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                      {group.title}
                    </h2>
                    {group.events.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {group.events.length}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <EventList
                  events={group.events}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteClick}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <EventDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
        event={editingEvent}
      />

      {deletingEvent?.recurrenceRule ? (
        <RecurringEventDeleteDialog
          open={!!deletingEvent}
          eventTitle={deletingEvent.title}
          onConfirm={handleDeleteEvent}
          onCancel={() => setDeletingEvent(undefined)}
        />
      ) : (
        <DeleteConfirmDialog
          open={!!deletingEvent}
          message={`「${deletingEvent?.title}」を削除しますか？この操作は取り消せません。`}
          onConfirm={() => handleDeleteEvent()}
          onCancel={() => setDeletingEvent(undefined)}
        />
      )}
      </div>
    </MainLayout>
  )
}
