'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
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
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { useEvents } from '@/hooks/useEvents'
import { useMode } from '@/lib/contexts/ModeContext'
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

  const groupedEvents = useMemo(() => groupEvents(events), [events])

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

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return

    try {
      setOperationError(null)
      await deleteEvent(deletingEvent.id)
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
            <Button onClick={() => setIsDialogOpen(true)}>予定を作成</Button>
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
          defaultValue={groupedEvents.map((group) => group.key)}
        >
          {groupedEvents.map((group) => (
            <AccordionItem key={group.key} value={group.key}>
              <AccordionHeader>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                      {group.title}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      ({group.events.length})
                    </span>
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

      <DeleteConfirmDialog
        open={!!deletingEvent}
        message={`「${deletingEvent?.title}」を削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteEvent}
        onCancel={() => setDeletingEvent(undefined)}
      />
      </div>
    </MainLayout>
  )
}
