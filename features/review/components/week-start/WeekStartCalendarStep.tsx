'use client'

import { useMemo, useState, useCallback } from 'react'
import { WeekView, getWeekDays, getHolidaysForDateRange } from '@/features/calendar'
import {
  useTasks,
  expandRecurringTasks,
} from '@/features/tasks'
import {
  useEvents,
  EventDialog,
  RecurringEventDeleteDialog,
  expandRecurringEvents,
} from '@/features/events'
import { useDevCalendarTasks, getDevTasksForWeek } from '@/features/dev/tasks'
import { useReviewTaskCrud } from '../../hooks/useReviewTaskCrud'
import { ReviewTaskDialogs } from '../ReviewTaskDialogs'
import { devTaskToTask } from '../../lib/devTaskToTask'
import type { Event, CreateEventInput } from '@/features/events'
import type { ReviewMode } from '../../types/review-completion'
import { format } from 'date-fns'

interface WeekStartCalendarStepProps {
  weekStartDate: Date
  weekStartDay: number
  mode: ReviewMode
}

export function WeekStartCalendarStep({
  weekStartDate,
  weekStartDay,
  mode,
}: WeekStartCalendarStepProps) {
  const { tasks: lifeTasks } = useTasks()
  const { tasks: devTasks } = useDevCalendarTasks()
  const { events: allEvents, updateEvent, deleteEvent } = useEvents()

  const crud = useReviewTaskCrud(mode)

  const weekDays = useMemo(
    () => getWeekDays(weekStartDate, weekStartDay),
    [weekStartDate, weekStartDay],
  )

  const weekStartDateStr = format(weekStartDate, 'yyyy-MM-dd')
  const weekEndDate = weekDays[weekDays.length - 1]
  const weekEndDateStr = weekEndDate
    ? format(weekEndDate, 'yyyy-MM-dd')
    : weekStartDateStr

  const holidays = useMemo(() => {
    if (weekDays.length === 0) return new Map<string, string>()
    return getHolidaysForDateRange(weekDays[0], weekDays[weekDays.length - 1])
  }, [weekDays])

  const weekTasks = useMemo(() => {
    if (mode === 'life') {
      return expandRecurringTasks(
        lifeTasks,
        weekDays[0],
        weekDays[weekDays.length - 1],
      )
    }
    return getDevTasksForWeek(devTasks, weekStartDateStr, weekEndDateStr)
      .map(devTaskToTask)
  }, [mode, lifeTasks, devTasks, weekDays, weekStartDateStr, weekEndDateStr])

  const weekEvents = useMemo(() => {
    if (mode !== 'life') return []
    if (weekDays.length === 0) return []
    const rangeStart = new Date(weekDays[0])
    rangeStart.setHours(0, 0, 0, 0)
    const rangeEnd = new Date(weekDays[weekDays.length - 1])
    rangeEnd.setHours(23, 59, 59, 999)
    return expandRecurringEvents(allEvents, rangeStart, rangeEnd)
  }, [mode, allEvents, weekDays])

  // Event CRUD
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null)

  const handleEditEvent = useCallback((event: Event) => {
    setEditingEvent(event)
  }, [])

  const handleEditEventSubmit = useCallback(async (input: CreateEventInput) => {
    if (!editingEvent) return
    await updateEvent(editingEvent.id, input)
    setEditingEvent(null)
  }, [editingEvent, updateEvent])

  const handleDeleteEvent = useCallback(async (event: Event) => {
    if (event.recurrenceRule) {
      setDeletingEvent(event)
    } else {
      await deleteEvent(event.id)
    }
  }, [deleteEvent])

  const handleRecurringEventDeleteConfirm = useCallback(async (deleteMode: 'single' | 'all') => {
    if (!deletingEvent) return
    try {
      if (deleteMode === 'all') {
        await deleteEvent(deletingEvent.id)
      } else {
        const currentDate = deletingEvent.startDatetime?.split('T')[0]
        const excluded = [
          ...(deletingEvent.recurrenceExcludedDates ?? []),
          ...(currentDate ? [currentDate] : []),
        ]
        await updateEvent(deletingEvent.id, { recurrenceExcludedDates: excluded })
      }
    } finally {
      setDeletingEvent(null)
    }
  }, [deletingEvent, updateEvent, deleteEvent])

  return (
    <div className="space-y-4">
      <WeekView
        currentDate={weekStartDate}
        weeklyGoals={[]}
        events={weekEvents}
        tasks={weekTasks}
        weekStartDay={weekStartDay}
        showWeeklyGoalForm={false}
        compact
        holidays={holidays}
        onEditEvent={mode === 'life' ? handleEditEvent : undefined}
        onDeleteEvent={mode === 'life' ? handleDeleteEvent : undefined}
        onEditTask={crud.handleEdit}
        onDeleteTask={crud.handleDelete}
        onToggleTaskCompletion={crud.handleToggleCompletion}
      />

      {mode === 'life' && (
        <>
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
        </>
      )}

      <ReviewTaskDialogs
        editingTask={crud.editingTask}
        deletingTask={crud.deletingTask}
        onEditClose={() => crud.setEditingTask(null)}
        onEditSubmit={crud.handleEditSubmit}
        onRecurringDeleteConfirm={crud.handleRecurringDeleteConfirm}
        onDeleteCancel={() => crud.setDeletingTask(null)}
      />
    </div>
  )
}
