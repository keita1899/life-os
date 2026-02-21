'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { startOfDay, subYears, addMonths } from 'date-fns'
import { CreateButton } from '@/components/ui/create-button'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { GroupedAccordion } from '@/components/ui/grouped-accordion'
import {
  EventList,
  EventDialog,
  RecurringEventDeleteDialog,
  useEvents,
  expandRecurringEvents,
  groupEvents,
} from '@/features/events'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import type {
  CreateEventInput,
  Event,
  UpdateEventInput,
} from '@/features/events'

export default function EventsPage() {
  const { events, isLoading, error, createEvent, updateEvent, deleteEvent } =
    useEvents()
  const {
    isDialogOpen,
    editingItem: editingEvent,
    handleEdit: handleEditEvent,
    handleDialogClose,
    handleCreateClick,
  } = useDialogState<Event>()
  const deleteConfirm = useDeleteConfirm<Event>()
  const { operationError, setOperationError, execute } = useAsyncOperation()

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

  const [openAccordionKeys, setOpenAccordionKeys] = useState<string[]>([])
  const groupKeys = useMemo(() => visibleGroups.map((g) => g.key), [visibleGroups])
  const seenAccordionKeysRef = useRef<string[]>([])
  useEffect(() => {
    if (groupKeys.length === 0) return
    const added = groupKeys.filter((k) => !seenAccordionKeysRef.current.includes(k))
    if (added.length > 0) {
      seenAccordionKeysRef.current = groupKeys
      setOpenAccordionKeys((prev) => [...new Set([...prev, ...added])])
    }
  }, [groupKeys])

  const handleCreateEvent = async (input: CreateEventInput) => {
    const result = await execute(
      () => createEvent(input),
      '予定の作成に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
    }
  }

  const handleUpdateEvent = async (input: CreateEventInput) => {
    if (!editingEvent) return

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
    const result = await execute(
      () => updateEvent(editingEvent.id, updateInput),
      '予定の更新に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
    }
  }

  const handleDeleteEvent = async (mode?: 'single' | 'all') => {
    const event = deleteConfirm.deletingItem
    if (!event) return

    const result = await execute(async () => {
      if (event.recurrenceRule && mode === 'single' && event.startDatetime) {
        const eventDate = event.startDatetime.split('T')[0]
        const currentExcludedDates = event.recurrenceExcludedDates || []
        if (!currentExcludedDates.includes(eventDate)) {
          await updateEvent(event.id, {
            recurrenceExcludedDates: [...currentExcludedDates, eventDate],
          })
        }
      } else {
        await deleteEvent(event.id)
      }
      return true
    }, '予定の削除に失敗しました')
    if (result !== undefined) {
      deleteConfirm.clearDeletingItem()
    }
  }

  useCreateShortcut({
    onCreate: handleCreateClick,
    enabled: !isDialogOpen,
  })

  return (
    <>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">予定</h1>
            </div>
            <CreateButton label="予定を作成" onClick={handleCreateClick} />
          </div>
        </div>

      <ErrorMessage
        message={operationError || error || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <GroupedAccordion
          value={openAccordionKeys}
          onValueChange={setOpenAccordionKeys}
          items={visibleGroups.map((group) => ({
            key: group.key,
            trigger: (
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
            ),
            content: (
              <EventList
                events={group.events}
                onEdit={handleEditEvent}
                onDelete={deleteConfirm.handleDeleteClick}
              />
            ),
          }))}
        />
      )}

      <EventDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
        event={editingEvent}
      />

      {deleteConfirm.deletingItem?.recurrenceRule ? (
        <RecurringEventDeleteDialog
          open={!!deleteConfirm.deletingItem}
          eventTitle={deleteConfirm.deletingItem.title}
          onConfirm={handleDeleteEvent}
          onCancel={deleteConfirm.handleDeleteCancel}
        />
      ) : (
        <DeleteConfirmDialog
          open={!!deleteConfirm.deletingItem}
          message={`「${deleteConfirm.deletingItem?.title}」を削除しますか？この操作は取り消せません。`}
          onConfirm={() => handleDeleteEvent()}
          onCancel={deleteConfirm.handleDeleteCancel}
        />
      )}
      </div>
    </>
  )
}
