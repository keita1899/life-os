'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { CalendarViewBase } from './CalendarViewBase'
import { MonthlyGoalCalendarForm } from '@/components/goals/MonthlyGoalCalendarForm'
import { BucketListList } from '@/components/bucket-list/BucketListList'
import { useGoals } from '@/hooks/useGoals'
import { useEvents } from '@/hooks/useEvents'
import { useTasks } from '@/hooks/useTasks'
import { useBucketList } from '@/hooks/useBucketList'
import { useCalendarView } from '@/hooks/useCalendarView'
import { useUserSettings } from '@/hooks/useUserSettings'
import { useBarcelonaMatches } from '@/hooks/useBarcelonaMatches'
import { EventDialog } from '@/components/events/EventDialog'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { ErrorMessage } from '@/components/ui/error-message'
import { expandRecurringEvents } from '@/lib/events'
import type { CreateEventInput, Event, UpdateEventInput } from '@/lib/types/event'
import type { CreateTaskInput, Task, UpdateTaskInput } from '@/lib/types/task'

interface CalendarViewProps {
  initialDate?: Date
}

export function CalendarView({ initialDate }: CalendarViewProps) {
  const {
    currentDate,
    viewMode,
    setViewMode,
    weekStartDay,
    isLoadingSettings,
    handlePrev,
    handleNext,
    displayTitle,
  } = useCalendarView({ initialDate })

  const currentYear = currentDate.getFullYear()
  const {
    monthlyGoals,
    weeklyGoals,
    isLoading: isLoadingGoals,
  } = useGoals(currentYear)
  const {
    events,
    isLoading: isLoadingEvents,
    error: eventsError,
    updateEvent,
    deleteEvent,
  } = useEvents()
  const {
    tasks,
    isLoading: isLoadingTasks,
    error: tasksError,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  } = useTasks()
  const { userSettings } = useUserSettings()
  useBarcelonaMatches(userSettings?.barcelonaIcalUrl ?? null)
  const { items: bucketListItems } = useBucketList()
  const bucketListItemsForMonth = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    return bucketListItems.filter(
      (item) =>
        item.targetYear === year &&
        item.targetMonth === month,
    )
  }, [bucketListItems, currentDate])

  const weekStartsOn = (weekStartDay === 0 ? 0 : 1) as 0 | 1
  const expandedEvents = useMemo(() => {
    const rangeStart =
      viewMode === 'month'
        ? startOfMonth(currentDate)
        : startOfWeek(currentDate, { weekStartsOn })
    const rangeEnd =
      viewMode === 'month'
        ? endOfMonth(currentDate)
        : endOfWeek(currentDate, { weekStartsOn })
    return expandRecurringEvents(events, rangeStart, rangeEnd)
  }, [events, currentDate, viewMode, weekStartDay])
  const [operationError, setOperationError] = useState<string | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined)
  const [deletingEvent, setDeletingEvent] = useState<Event | undefined>(undefined)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [deletingTask, setDeletingTask] = useState<Task | undefined>(undefined)

  const isLoading =
    isLoadingGoals || isLoadingEvents || isLoadingTasks || isLoadingSettings

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setIsEventDialogOpen(true)
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
      setIsEventDialogOpen(false)
      setEditingEvent(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '予定の更新に失敗しました',
      )
    }
  }

  const handleDeleteEventClick = (event: Event) => {
    setDeletingEvent(event)
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

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleUpdateTask = async (input: CreateTaskInput) => {
    if (!editingTask) return

    try {
      setOperationError(null)
      const updateInput: UpdateTaskInput = {
        title: input.title,
        executionDate: input.executionDate,
      }
      await updateTask(editingTask.id, updateInput)
      setIsTaskDialogOpen(false)
      setEditingTask(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの更新に失敗しました',
      )
    }
  }

  const handleDeleteTaskClick = (task: Task) => {
    setDeletingTask(task)
  }

  const handleDeleteTask = async () => {
    if (!deletingTask) return

    try {
      setOperationError(null)
      await deleteTask(deletingTask.id)
      setDeletingTask(undefined)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの削除に失敗しました',
      )
    }
  }

  const handleToggleTaskCompletion = async (task: Task) => {
    try {
      setOperationError(null)
      await toggleTaskCompletion(task.id, !task.completed)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの完了状態の更新に失敗しました',
      )
    }
  }

  return (
    <>
      <ErrorMessage
        message={operationError || eventsError || tasksError || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />
      <CalendarViewBase
        displayTitle={displayTitle}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        isLoading={isLoading}
      >
        {viewMode === 'month' && (
          <MonthlyGoalCalendarForm
            currentDate={currentDate}
            monthlyGoals={monthlyGoals}
          />
        )}
        {viewMode === 'month' ? (
          <MonthView
            currentDate={currentDate}
            monthlyGoals={monthlyGoals}
            events={expandedEvents}
            tasks={tasks}
            weekStartDay={weekStartDay}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEventClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTaskClick}
            onToggleTaskCompletion={handleToggleTaskCompletion}
          />
        ) : (
          <WeekView
            currentDate={currentDate}
            monthlyGoals={monthlyGoals}
            weeklyGoals={weeklyGoals}
            events={expandedEvents}
            tasks={tasks}
            weekStartDay={weekStartDay}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEventClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTaskClick}
            onToggleTaskCompletion={handleToggleTaskCompletion}
          />
        )}
      </CalendarViewBase>

      {viewMode === 'month' && (
        <Card className="mt-4 border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">
              {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月のやりたいこと
            </CardTitle>
            <Link
              href="/bucket-list"
              className="text-sm text-primary hover:underline"
            >
              やりたいことリストへ
            </Link>
          </CardHeader>
          <CardContent>
            <BucketListList items={bucketListItemsForMonth} />
          </CardContent>
        </Card>
      )}

      <EventDialog
        open={isEventDialogOpen}
        onOpenChange={(open) => {
          setIsEventDialogOpen(open)
          if (!open) {
            setEditingEvent(undefined)
          }
        }}
        onSubmit={handleUpdateEvent}
        event={editingEvent}
      />

      <DeleteConfirmDialog
        open={!!deletingEvent}
        message={
          deletingEvent?.recurrenceRule
            ? `「${deletingEvent.title}」の繰り返し予定をすべて削除しますか？この操作は取り消せません。`
            : `「${deletingEvent?.title}」を削除しますか？この操作は取り消せません。`
        }
        onConfirm={handleDeleteEvent}
        onCancel={() => setDeletingEvent(undefined)}
      />

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={(open) => {
          setIsTaskDialogOpen(open)
          if (!open) {
            setEditingTask(undefined)
          }
        }}
        onSubmit={handleUpdateTask}
        task={editingTask}
      />

      <DeleteConfirmDialog
        open={!!deletingTask}
        message={`「${deletingTask?.title}」を削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteTask}
        onCancel={() => setDeletingTask(undefined)}
      />
    </>
  )
}
