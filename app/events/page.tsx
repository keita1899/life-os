'use client'

import { useState, useMemo, useCallback } from 'react'
import { startOfDay, subYears, addMonths, addDays, format, parseISO, setHours, setMinutes, setSeconds, getHours, getMinutes, getSeconds } from 'date-fns'
import { Button } from '@/components/ui/button'
import { InlineCreateButton } from '@/components/ui/inline-create-button'
import { CreateButton } from '@/components/ui/create-button'
import { useCreateShortcut } from '@/hooks/useCreateShortcut'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useAutoExpandAccordion } from '@/hooks/useAutoExpandAccordion'
import { useCrossGroupDnd } from '@/hooks/useCrossGroupDnd'
import { GroupedAccordion } from '@/components/ui/grouped-accordion'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { DragOverlayPreview } from '@/components/ui/drag-overlay-preview'
import { Calendar } from 'lucide-react'
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
  const { events, isLoading, error, createEvent, updateEvent, deleteEvent, reorderEvents } =
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

  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined)

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

  const groupKeys = useMemo(() => visibleGroups.map((g) => g.key), [visibleGroups])
  const { openKeys: openAccordionKeys, setOpenKeys: setOpenAccordionKeys } =
    useAutoExpandAccordion(groupKeys)

  // DnD 用グループ: 各グループ内のイベントをアイテムとして渡す
  const dndGroups = useMemo(
    () =>
      visibleGroups.map((g) => ({
        key: g.key,
        items: g.events,
      })),
    [visibleGroups],
  )

  const crossGroupDnd = useCrossGroupDnd({
    visibleGroups: dndGroups,
    allItems: expandedEvents,
    reorderItems: reorderEvents,
    updateDate: async (id, dateStr) => {
      const event = events.find((e) => e.id === id)
      if (!event || !dateStr) return

      // 元の時刻を保持しつつ日付を変更
      const originalDate = parseISO(event.startDatetime)
      const newDate = parseISO(dateStr)
      const newStart = setSeconds(
        setMinutes(
          setHours(newDate, getHours(originalDate)),
          getMinutes(originalDate),
        ),
        getSeconds(originalDate),
      )
      const newStartDatetime = format(newStart, "yyyy-MM-dd'T'HH:mm:ss")

      // endDatetime も同じ日数分シフト
      let newEndDatetime: string | null = null
      if (event.endDatetime) {
        const originalEnd = parseISO(event.endDatetime)
        const durationMs = originalEnd.getTime() - originalDate.getTime()
        const newEnd = new Date(newStart.getTime() + durationMs)
        newEndDatetime = format(newEnd, "yyyy-MM-dd'T'HH:mm:ss")
      }

      await execute(
        () =>
          updateEvent(id, {
            startDatetime: newStartDatetime,
            endDatetime: newEndDatetime,
          }),
        '予定の移動に失敗しました',
      )
    },
    excludedGroupKeys: [],
    disableSameGroupReorder: true,
  })

  const handleCreateEvent = async (input: CreateEventInput) => {
    const result = await execute(
      () => createEvent(input),
      '予定の作成に失敗しました',
    )
    if (result !== undefined) {
      handleDialogClose(false)
      setDefaultDate(undefined)
    }
  }

  const handleInlineCreate = useCallback((date: string | undefined) => {
    setDefaultDate(date)
    handleCreateClick()
  }, [handleCreateClick])

  const getGroupDate = useCallback((key: string): string | undefined => {
    const today = new Date()
    if (key === 'today') return format(today, 'yyyy-MM-dd')
    if (key === 'tomorrow') return format(addDays(today, 1), 'yyyy-MM-dd')
    if (key === 'overdue') return format(today, 'yyyy-MM-dd')
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) return key
    return undefined
  }, [])

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

  const handleRenameEvent = async (event: Event, title: string) => {
    await execute(
      () => updateEvent(event.id, { title }),
      '予定名の更新に失敗しました',
    )
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
        <DndContext
          sensors={crossGroupDnd.sensors}
          collisionDetection={closestCenter}
          onDragStart={crossGroupDnd.handleDragStart}
          onDragOver={crossGroupDnd.handleDragOver}
          onDragEnd={crossGroupDnd.handleDragEnd}
          onDragCancel={crossGroupDnd.handleDragCancel}
        >
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
                <div className="space-y-4">
                  <EventList
                    events={group.events}
                    onEdit={handleEditEvent}
                    onDelete={deleteConfirm.handleDeleteClick}
                    onRename={handleRenameEvent}
                    onReorder={reorderEvents}
                    groupKey={group.key}
                    isDropTarget={crossGroupDnd.isDropTarget(group.key)}
                    insertBeforeId={crossGroupDnd.isDropTarget(group.key) ? crossGroupDnd.insertBeforeId : undefined}
                  />
                  {group.key !== 'overdue' && (
                    <InlineCreateButton
                      label="予定を追加"
                      onClick={() => handleInlineCreate(getGroupDate(group.key))}
                    />
                  )}
                </div>
              ),
            }))}
          />
          <DragOverlayPreview
            activeItem={crossGroupDnd.activeTask}
            icon={<Calendar className="mt-0.5 h-5 w-5 shrink-0 text-sky-700 dark:text-sky-300" />}
          />
        </DndContext>
      )}

      <EventDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          handleDialogClose(open)
          if (!open) setDefaultDate(undefined)
        }}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
        event={editingEvent}
        defaultStartDate={defaultDate}
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
