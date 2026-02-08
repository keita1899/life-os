'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  parseISO,
} from 'date-fns'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { CalendarViewBase } from './CalendarViewBase'
import { MonthlyGoalCalendarForm } from '@/components/goals/MonthlyGoalCalendarForm'
import { BucketListList } from '@/components/bucket-list/BucketListList'
import { BucketListDialog } from '@/components/bucket-list/BucketListDialog'
import { useGoals } from '@/hooks/useGoals'
import { useEvents } from '@/hooks/useEvents'
import { useTasks } from '@/hooks/useTasks'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useBucketList } from '@/hooks/useBucketList'
import { useCalendarView } from '@/hooks/useCalendarView'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useUserSettings } from '@/hooks/useUserSettings'
import { useBarcelonaMatches } from '@/hooks/useBarcelonaMatches'
import { EventDialog } from '@/components/events/EventDialog'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { ErrorMessage } from '@/components/ui/error-message'
import { expandRecurringEvents } from '@/lib/events'
import {
  toTasksWithNextOccurrenceOnly,
  getNextOccurrenceAfter,
} from '@/lib/tasks'
import { getHolidaysForDateRange } from '@/lib/calendar/holidays'
import type { CreateEventInput, Event, UpdateEventInput } from '@/lib/types/event'
import type { CreateTaskInput, Task, UpdateTaskInput } from '@/lib/types/task'
import type { Subscription } from '@/lib/types/subscription'
import type { BucketListItem, CreateBucketListItemInput, UpdateBucketListItemInput } from '@/lib/types/bucket-list-item'

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
  const {
    subscriptions,
    isLoading: isLoadingSubscriptions,
    deleteSubscription,
  } = useSubscriptions()
  const { userSettings } = useUserSettings()
  useBarcelonaMatches(userSettings?.barcelonaIcalUrl ?? null)
  const {
    items: bucketListItems,
    updateBucketListItem,
    deleteBucketListItem,
  } = useBucketList()
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
  const rangeStart = useMemo(
    () =>
      viewMode === 'month'
        ? startOfMonth(currentDate)
        : startOfWeek(currentDate, { weekStartsOn }),
    [viewMode, currentDate, weekStartsOn],
  )
  const rangeEnd = useMemo(
    () =>
      viewMode === 'month'
        ? endOfMonth(currentDate)
        : endOfWeek(currentDate, { weekStartsOn }),
    [viewMode, currentDate, weekStartsOn],
  )
  const expandedEvents = useMemo(
    () => expandRecurringEvents(events, rangeStart, rangeEnd),
    [events, rangeStart, rangeEnd],
  )
  const expandedTasks = useMemo(
    () => toTasksWithNextOccurrenceOnly(tasks, rangeStart),
    [tasks, rangeStart],
  )
  const holidays = useMemo(
    () => getHolidaysForDateRange(rangeStart, rangeEnd),
    [rangeStart, rangeEnd],
  )
  const { operationError, setOperationError, execute } = useAsyncOperation()
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined)
  const [deletingEvent, setDeletingEvent] = useState<Event | undefined>(undefined)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [deletingTask, setDeletingTask] = useState<Task | undefined>(undefined)
  const [isBucketListDialogOpen, setIsBucketListDialogOpen] = useState(false)
  const [editingBucketListItem, setEditingBucketListItem] = useState<BucketListItem | undefined>(undefined)
  const [deletingBucketListItem, setDeletingBucketListItem] = useState<BucketListItem | undefined>(undefined)
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | undefined>(undefined)

  const isLoading =
    isLoadingGoals || isLoadingEvents || isLoadingTasks || isLoadingSubscriptions || isLoadingSettings

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setIsEventDialogOpen(true)
  }

  const handleUpdateEvent = async (input: CreateEventInput) => {
    if (!editingEvent) return

    const eventId = editingEvent.id
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
      () => updateEvent(eventId, updateInput),
      '予定の更新に失敗しました',
    )
    if (result !== undefined) {
      setIsEventDialogOpen(false)
      setEditingEvent(undefined)
    }
  }

  const handleDeleteEventClick = (event: Event) => {
    setDeletingEvent(event)
  }

  const handleDeleteEvent = async () => {
    const eventToDelete = deletingEvent
    if (!eventToDelete) return

    const result = await execute(
      async () => {
        await deleteEvent(eventToDelete.id)
        return true
      },
      '予定の削除に失敗しました',
    )
    if (result !== undefined) {
      setDeletingEvent(undefined)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleUpdateTask = async (input: CreateTaskInput) => {
    if (!editingTask) return

    const taskId = editingTask.id
    const updateInput: UpdateTaskInput = {
      title: input.title,
      executionDate: input.executionDate,
      recurrenceRule: input.recurrenceRule,
      recurrenceDaysOfWeek: input.recurrenceDaysOfWeek,
      recurrenceDayOfMonth: input.recurrenceDayOfMonth,
      recurrenceEndDate: input.recurrenceEndDate,
    }
    const result = await execute(
      () => updateTask(taskId, updateInput),
      'タスクの更新に失敗しました',
    )
    if (result !== undefined) {
      setIsTaskDialogOpen(false)
      setEditingTask(undefined)
    }
  }

  const handleDeleteTaskClick = (task: Task) => {
    setDeletingTask(task)
  }

  const handleDeleteTask = async () => {
    const taskToDelete = deletingTask
    if (!taskToDelete) return

    const result = await execute(
      async () => {
        await deleteTask(taskToDelete.id)
        return true
      },
      'タスクの削除に失敗しました',
    )
    if (result !== undefined) {
      setDeletingTask(undefined)
    }
  }

  const handleToggleTaskCompletion = async (task: Task) => {
    await execute(
      async () => {
        if (
          task.recurrenceRule &&
          !task.completed &&
          task.executionDate
        ) {
          const nextDate = getNextOccurrenceAfter(
            task,
            parseISO(task.executionDate),
          )
          if (nextDate !== null) {
            await updateTask(task.id, {
              executionDate: nextDate,
              completed: false,
            })
            return
          }
        }
        await toggleTaskCompletion(task.id, !task.completed)
      },
      'タスクの完了状態の更新に失敗しました',
    )
  }

  const handleEditBucketListItem = (item: BucketListItem) => {
    setEditingBucketListItem(item)
    setIsBucketListDialogOpen(true)
  }

  const handleUpdateBucketListItem = async (input: CreateBucketListItemInput) => {
    if (!editingBucketListItem) return

    const itemId = editingBucketListItem.id
    const updateInput: UpdateBucketListItemInput = {
      title: input.title,
      categoryId: input.categoryId,
      targetYear: input.targetYear,
      targetMonth: input.targetMonth,
    }
    const result = await execute(
      () => updateBucketListItem(itemId, updateInput),
      'やりたいことの更新に失敗しました',
    )
    if (result !== undefined) {
      setIsBucketListDialogOpen(false)
      setEditingBucketListItem(undefined)
    }
  }

  const handleDeleteBucketListItemClick = (item: BucketListItem) => {
    setDeletingBucketListItem(item)
  }

  const handleDeleteBucketListItem = async () => {
    const itemToDelete = deletingBucketListItem
    if (!itemToDelete) return

    const result = await execute(
      async () => {
        await deleteBucketListItem(itemToDelete.id)
        return true
      },
      'やりたいことの削除に失敗しました',
    )
    if (result !== undefined) {
      setDeletingBucketListItem(undefined)
    }
  }

  const handleEditSubscription = (subscription: Subscription) => {
    window.location.href = '/subscriptions'
  }

  const handleDeleteSubscriptionClick = (subscription: Subscription) => {
    setDeletingSubscription(subscription)
  }

  const handleDeleteSubscription = async () => {
    const subscriptionToDelete = deletingSubscription
    if (!subscriptionToDelete) return

    const result = await execute(
      async () => {
        await deleteSubscription(subscriptionToDelete.id)
        return true
      },
      'サブスクの削除に失敗しました',
    )
    if (result !== undefined) {
      setDeletingSubscription(undefined)
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
            events={expandedEvents}
            tasks={expandedTasks}
            subscriptions={subscriptions}
            weekStartDay={weekStartDay}
            holidays={holidays}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEventClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTaskClick}
            onToggleTaskCompletion={handleToggleTaskCompletion}
            onEditSubscription={handleEditSubscription}
            onDeleteSubscription={handleDeleteSubscriptionClick}
          />
        ) : (
          <WeekView
            currentDate={currentDate}
            weeklyGoals={weeklyGoals}
            events={expandedEvents}
            tasks={expandedTasks}
            subscriptions={subscriptions}
            weekStartDay={weekStartDay}
            holidays={holidays}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEventClick}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTaskClick}
            onToggleTaskCompletion={handleToggleTaskCompletion}
            onEditSubscription={handleEditSubscription}
            onDeleteSubscription={handleDeleteSubscriptionClick}
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
            <BucketListList
              items={bucketListItemsForMonth}
              onEdit={handleEditBucketListItem}
              onDelete={handleDeleteBucketListItemClick}
            />
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
        message={
          deletingTask?.recurrenceRule
            ? `「${deletingTask?.title}」は繰り返しタスクです。削除するとすべての発生が削除されます。この操作は取り消せません。`
            : `「${deletingTask?.title}」を削除しますか？この操作は取り消せません。`
        }
        onConfirm={handleDeleteTask}
        onCancel={() => setDeletingTask(undefined)}
      />

      <BucketListDialog
        open={isBucketListDialogOpen}
        onOpenChange={(open) => {
          setIsBucketListDialogOpen(open)
          if (!open) {
            setEditingBucketListItem(undefined)
          }
        }}
        onSubmit={handleUpdateBucketListItem}
        item={editingBucketListItem}
      />

      <DeleteConfirmDialog
        open={!!deletingBucketListItem}
        message={`「${deletingBucketListItem?.title}」を削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteBucketListItem}
        onCancel={() => setDeletingBucketListItem(undefined)}
      />

      <DeleteConfirmDialog
        open={!!deletingSubscription}
        message={`「${deletingSubscription?.name}」を削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteSubscription}
        onCancel={() => setDeletingSubscription(undefined)}
      />
    </>
  )
}
