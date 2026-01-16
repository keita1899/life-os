'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { EventList } from '@/components/events/EventList'
import { EventDialog } from '@/components/events/EventDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { useEvents } from '@/hooks/useEvents'
import { useMode } from '@/lib/contexts/ModeContext'
import type {
  CreateEventInput,
  Event,
  UpdateEventInput,
} from '@/lib/types/event'

type EventGroup = {
  key: string
  title: string
  events: Event[]
}

const GROUP_KEYS = {
  TODAY: 'today',
  TOMORROW: 'tomorrow',
  OVERDUE: 'overdue',
} as const

function getDateStrings() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return {
    today,
    tomorrow,
    todayStr: format(today, 'yyyy-MM-dd'),
    tomorrowStr: format(tomorrow, 'yyyy-MM-dd'),
  }
}

function createInitialGroups(): {
  todayGroup: EventGroup
  tomorrowGroup: EventGroup
  overdueGroup: EventGroup
} {
  return {
    todayGroup: { key: GROUP_KEYS.TODAY, title: '今日', events: [] },
    tomorrowGroup: { key: GROUP_KEYS.TOMORROW, title: '明日', events: [] },
    overdueGroup: { key: GROUP_KEYS.OVERDUE, title: '過去', events: [] },
  }
}

function getEventDateString(event: Event): string {
  const eventStartDate = parseISO(event.startDatetime)
  eventStartDate.setHours(0, 0, 0, 0)
  return format(eventStartDate, 'yyyy-MM-dd')
}

function categorizeEvent(
  event: Event,
  todayStr: string,
  tomorrowStr: string,
  today: Date,
): 'today' | 'tomorrow' | 'overdue' | 'future' {
  const eventDateStr = getEventDateString(event)
  const eventStartDate = parseISO(event.startDatetime)
  eventStartDate.setHours(0, 0, 0, 0)

  if (eventDateStr === todayStr) {
    return 'today'
  }
  if (eventDateStr === tomorrowStr) {
    return 'tomorrow'
  }
  if (eventStartDate < today) {
    return 'overdue'
  }
  return 'future'
}

function createDateGroup(dateStr: string): EventGroup {
  return {
    key: dateStr,
    title: format(parseISO(dateStr), 'yyyy年M月d日(E)', { locale: ja }),
    events: [],
  }
}

function groupEvents(events: Event[]): EventGroup[] {
  const { today, todayStr, tomorrowStr } = getDateStrings()
  const { todayGroup, tomorrowGroup, overdueGroup } = createInitialGroups()
  const dateGroups = new Map<string, Event[]>()

  events.forEach((event) => {
    const category = categorizeEvent(event, todayStr, tomorrowStr, today)

    switch (category) {
      case 'today':
        todayGroup.events.push(event)
        break
      case 'tomorrow':
        tomorrowGroup.events.push(event)
        break
      case 'overdue':
        overdueGroup.events.push(event)
        break
      case 'future': {
        const eventDateStr = getEventDateString(event)
        if (!dateGroups.has(eventDateStr)) {
          dateGroups.set(eventDateStr, [])
        }
        dateGroups.get(eventDateStr)!.push(event)
        break
      }
    }
  })

  const sortedDateGroups = Array.from(dateGroups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, groupEvents]) => ({
      ...createDateGroup(dateStr),
      events: groupEvents,
    }))

  return [todayGroup, tomorrowGroup, overdueGroup, ...sortedDateGroups].filter(
    (group) => group.events.length > 0,
  )
}

export default function EventsPage() {
  const { mode } = useMode()
  const { events, isLoading, error, createEvent, updateEvent, deleteEvent } =
    useEvents()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined)
  const [deletingEvent, setDeletingEvent] = useState<Event | undefined>(
    undefined,
  )
  const [createError, setCreateError] = useState<string | null>(null)

  const groupedEvents = useMemo(() => groupEvents(events), [events])

  const handleCreateEvent = async (input: CreateEventInput) => {
    try {
      setCreateError(null)
      await createEvent(input)
      setIsDialogOpen(false)
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : '予定の作成に失敗しました',
      )
    }
  }

  const handleUpdateEvent = async (input: CreateEventInput) => {
    if (!editingEvent) return

    try {
      setCreateError(null)
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
      setCreateError(
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
      setCreateError(null)
      await deleteEvent(deletingEvent.id)
      setDeletingEvent(undefined)
    } catch (err) {
      setCreateError(
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
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← ホームに戻る
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">予定管理</h1>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>予定を作成</Button>
        </div>
      </div>

      <ErrorMessage
        message={createError || error || ''}
        onDismiss={createError ? () => setCreateError(null) : undefined}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <Accordion type="multiple" className="w-full">
          {groupedEvents.map((group) => (
            <AccordionItem key={group.key} value={group.key}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex w-full items-center justify-between pr-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                      {group.title}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      ({group.events.length})
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
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
  )
}
