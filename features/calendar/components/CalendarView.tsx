'use client'

import { useMemo } from 'react'
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
import { MonthlyGoalCalendarForm } from '@/features/goals'
import {
  BucketListList,
  BucketListDialog,
  useBucketList,
} from '@/features/bucket-list'
import { useGoals } from '@/features/goals'
import { useEvents } from '@/features/events'
import { useTasks } from '@/features/tasks'
import { useSubscriptions } from '@/features/subscriptions'
import { useCalendarView } from '../hooks/useCalendarView'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useUserSettings } from '@/features/settings'
import { useBarcelonaMatches } from '@/hooks/useBarcelonaMatches'
import { EventDialog } from '@/features/events'
import { TaskDialog } from '@/features/tasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { ErrorMessage } from '@/components/ui/error-message'
import { expandRecurringEvents } from '@/features/events'
import {
  toTasksWithNextOccurrenceOnly,
  getNextOccurrenceAfter,
} from '@/features/tasks'
import { getHolidaysForDateRange } from '../lib/holidays'
import type { CreateEventInput, Event, UpdateEventInput } from '@/features/events'
import type { CreateTaskInput, Task, UpdateTaskInput } from '@/features/tasks'
import type { BucketListItem, CreateBucketListItemInput, UpdateBucketListItemInput } from '@/features/bucket-list'

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
  const eventDialog = useDialogState<Event>()
  const eventDeleteConfirm = useDeleteConfirm<Event>()
  const taskDialog = useDialogState<Task>()
  const taskDeleteConfirm = useDeleteConfirm<Task>()
  const bucketListDialog = useDialogState<BucketListItem>()
  const bucketListDeleteConfirm = useDeleteConfirm<BucketListItem>()
  const isLoading =
    isLoadingGoals || isLoadingEvents || isLoadingTasks || isLoadingSubscriptions || isLoadingSettings

  const handleUpdateEvent = async (input: CreateEventInput) => {
    const editingEvent = eventDialog.editingItem
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
      eventDialog.handleDialogClose(false)
    }
  }

  const handleDeleteEvent = async () => {
    const eventToDelete = eventDeleteConfirm.deletingItem
    if (!eventToDelete) return

    const result = await execute(
      async () => {
        await deleteEvent(eventToDelete.id)
        return true
      },
      '予定の削除に失敗しました',
    )
    if (result !== undefined) {
      eventDeleteConfirm.clearDeletingItem()
    }
  }

  const handleUpdateTask = async (input: CreateTaskInput) => {
    const editingTask = taskDialog.editingItem
    if (!editingTask) return

    const taskId = editingTask.id
    const updateInput: UpdateTaskInput = {
      title: input.title,
      executionDate: input.executionDate,
      scheduledTime: input.scheduledTime,
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
      taskDialog.handleDialogClose(false)
    }
  }

  const handleDeleteTask = async () => {
    const taskToDelete = taskDeleteConfirm.deletingItem
    if (!taskToDelete) return

    const result = await execute(
      async () => {
        await deleteTask(taskToDelete.id)
        return true
      },
      'タスクの削除に失敗しました',
    )
    if (result !== undefined) {
      taskDeleteConfirm.clearDeletingItem()
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

  const handleUpdateBucketListItem = async (input: CreateBucketListItemInput) => {
    const editingBucketListItem = bucketListDialog.editingItem
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
      bucketListDialog.handleDialogClose(false)
    }
  }

  const handleDeleteBucketListItem = async () => {
    const itemToDelete = bucketListDeleteConfirm.deletingItem
    if (!itemToDelete) return

    const result = await execute(
      async () => {
        await deleteBucketListItem(itemToDelete.id)
        return true
      },
      'やりたいことの削除に失敗しました',
    )
    if (result !== undefined) {
      bucketListDeleteConfirm.clearDeletingItem()
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
            onEditEvent={eventDialog.handleEdit}
            onDeleteEvent={eventDeleteConfirm.handleDeleteClick}
            onEditTask={taskDialog.handleEdit}
            onDeleteTask={taskDeleteConfirm.handleDeleteClick}
            onToggleTaskCompletion={handleToggleTaskCompletion}
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
            onEditEvent={eventDialog.handleEdit}
            onDeleteEvent={eventDeleteConfirm.handleDeleteClick}
            onEditTask={taskDialog.handleEdit}
            onDeleteTask={taskDeleteConfirm.handleDeleteClick}
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
            <BucketListList
              items={bucketListItemsForMonth}
              onEdit={bucketListDialog.handleEdit}
              onDelete={bucketListDeleteConfirm.handleDeleteClick}
            />
          </CardContent>
        </Card>
      )}

      <EventDialog
        open={eventDialog.isDialogOpen}
        onOpenChange={eventDialog.handleDialogClose}
        onSubmit={handleUpdateEvent}
        event={eventDialog.editingItem}
      />

      <DeleteConfirmDialog
        open={!!eventDeleteConfirm.deletingItem}
        message={
          eventDeleteConfirm.deletingItem?.recurrenceRule
            ? `「${eventDeleteConfirm.deletingItem.title}」の繰り返し予定をすべて削除しますか？この操作は取り消せません。`
            : `「${eventDeleteConfirm.deletingItem?.title}」を削除しますか？この操作は取り消せません。`
        }
        onConfirm={handleDeleteEvent}
        onCancel={eventDeleteConfirm.handleDeleteCancel}
      />

      <TaskDialog
        open={taskDialog.isDialogOpen}
        onOpenChange={taskDialog.handleDialogClose}
        onSubmit={handleUpdateTask}
        task={taskDialog.editingItem}
      />

      <DeleteConfirmDialog
        open={!!taskDeleteConfirm.deletingItem}
        message={
          taskDeleteConfirm.deletingItem?.recurrenceRule
            ? `「${taskDeleteConfirm.deletingItem?.title}」は繰り返しタスクです。削除するとすべての発生が削除されます。この操作は取り消せません。`
            : `「${taskDeleteConfirm.deletingItem?.title}」を削除しますか？この操作は取り消せません。`
        }
        onConfirm={handleDeleteTask}
        onCancel={taskDeleteConfirm.handleDeleteCancel}
      />

      <BucketListDialog
        open={bucketListDialog.isDialogOpen}
        onOpenChange={bucketListDialog.handleDialogClose}
        onSubmit={handleUpdateBucketListItem}
        item={bucketListDialog.editingItem}
      />

      <DeleteConfirmDialog
        open={!!bucketListDeleteConfirm.deletingItem}
        message={`「${bucketListDeleteConfirm.deletingItem?.title}」を削除しますか？この操作は取り消せません。`}
        onConfirm={handleDeleteBucketListItem}
        onCancel={bucketListDeleteConfirm.handleDeleteCancel}
      />

    </>
  )
}
