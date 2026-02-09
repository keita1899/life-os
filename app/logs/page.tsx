'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { format, getYear, startOfDay, endOfDay } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { parseISO, isValid, addDays, subDays } from 'date-fns'
import { expandRecurringEvents } from '@/lib/events'
import {
  toTasksWithNextOccurrenceOnly,
  getNextOccurrenceAfter,
} from '@/lib/tasks'
import { useMode } from '@/lib/contexts/ModeContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CalendarPlus, CheckSquare, ChevronLeft, ChevronRight, Focus } from 'lucide-react'
import { useGoals } from '@/hooks/useGoals'
import { useTasks } from '@/hooks/useTasks'
import { useEvents } from '@/hooks/useEvents'
import { useDailyLog } from '@/hooks/useDailyLog'
import { useHabits } from '@/hooks/useHabits'
import { useHabitCompletionsByDate } from '@/hooks/useHabitCompletions'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { LogGoalsSection } from '@/components/logs/LogGoalsSection'
import { LogDiarySection } from '@/components/logs/LogDiarySection'
import { TimelineSection } from '@/components/logs/TimelineSection'
import { createTimelineItems } from '@/lib/logs/timeline'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { EventDialog } from '@/components/events/EventDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { RecurringTaskDeleteDialog } from '@/components/tasks/RecurringTaskDeleteDialog'
import { RecurringEventDeleteDialog } from '@/components/events/RecurringEventDeleteDialog'
import {
  getYearlyGoalsForDate,
  getMonthlyGoalsForDate,
  getWeeklyGoalsForDate,
  getTasksForDate,
  getEventsForDateSorted,
} from '@/lib/logs/utils'
import { isHabitDueOnDate } from '@/lib/habits'
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/lib/types/task'
import type { UpdateDailyLogInput } from '@/lib/types/daily-log'
import Link from 'next/link'
import type { CreateEventInput, Event, UpdateEventInput } from '@/lib/types/event'
import { FloatingActionButtons } from '@/components/floating/FloatingActionButtons'

interface LogPageViewProps {
  logDate: Date
  date: string
}

function LogPageView({ logDate, date }: LogPageViewProps) {
  const router = useRouter()
  const year = getYear(logDate)
  const {
    yearlyGoals: allYearlyGoals,
    monthlyGoals: allMonthlyGoals,
    weeklyGoals: allWeeklyGoals,
    isLoading: isLoadingGoals,
    error: goalsError,
  } = useGoals(year)
  const {
    tasks: allTasks,
    isLoading: isLoadingTasks,
    error: tasksError,
    createTask,
    toggleTaskCompletion,
    updateTask,
    deleteTask,
  } = useTasks()
  const taskDialog = useDialogState<Task>()
  const eventDialog = useDialogState<Event>()
  const deleteEventConfirm = useDeleteConfirm<Event>()
  const deleteTaskConfirm = useDeleteConfirm<Task>()
  const { operationError, setOperationError, execute } = useAsyncOperation()
  const {
    events: allEvents,
    isLoading: isLoadingEvents,
    error: eventsError,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents()
  const {
    dailyLog,
    isLoading: isLoadingDailyLog,
    createDailyLog,
    updateDailyLog,
  } = useDailyLog(date)
  const { habits: allHabits, isLoading: isLoadingHabits } = useHabits()
  const {
    completions: habitCompletions,
    isLoading: isLoadingHabitCompletions,
    createCompletion: createHabitCompletion,
    deleteCompletion: deleteHabitCompletion,
  } = useHabitCompletionsByDate(date)

  const yearlyGoals = useMemo(
    () => getYearlyGoalsForDate(allYearlyGoals, logDate),
    [allYearlyGoals, logDate],
  )
  const monthlyGoals = useMemo(
    () => getMonthlyGoalsForDate(allMonthlyGoals, logDate),
    [allMonthlyGoals, logDate],
  )
  const weeklyGoals = useMemo(
    () => getWeeklyGoalsForDate(allWeeklyGoals, logDate),
    [allWeeklyGoals, logDate],
  )
  const tasks = useMemo(() => {
    const withNextOnly = toTasksWithNextOccurrenceOnly(allTasks, logDate)
    return getTasksForDate(withNextOnly, logDate)
  }, [allTasks, logDate])
  const events = useMemo(() => {
    const rangeStart = startOfDay(logDate)
    const rangeEnd = endOfDay(logDate)
    const expanded = expandRecurringEvents(allEvents, rangeStart, rangeEnd)
    return getEventsForDateSorted(expanded, logDate)
  }, [allEvents, logDate])

  const habitsForDate = useMemo(() => {
    return allHabits.filter((h) => isHabitDueOnDate(h, logDate))
  }, [allHabits, logDate])

  const completedHabitIds = useMemo(
    () => new Set(habitCompletions.map((c) => c.habitId)),
    [habitCompletions],
  )

  const timelineItems = useMemo(
    () => createTimelineItems(events, habitsForDate, tasks, completedHabitIds),
    [events, habitsForDate, tasks, completedHabitIds],
  )

  const formattedDate = format(logDate, 'yyyy年M月d日(E)', { locale: ja })
  const prevDate = subDays(logDate, 1)
  const nextDate = addDays(logDate, 1)

  const handlePrevDate = () => {
    router.push(`/logs?date=${format(prevDate, 'yyyy-MM-dd')}`)
  }

  const handleNextDate = () => {
    router.push(`/logs?date=${format(nextDate, 'yyyy-MM-dd')}`)
  }

  const handleCreateTask = async (input: CreateTaskInput) => {
    const result = await execute(
      () => createTask(input),
      'タスクの作成に失敗しました',
    )
    if (result !== undefined) {
      taskDialog.handleDialogClose(false)
    }
  }

  const handleUpdateTask = async (input: CreateTaskInput) => {
    if (!taskDialog.editingItem) return

    const taskId = taskDialog.editingItem.id
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

  const handleCreateEvent = async (input: CreateEventInput) => {
    const result = await execute(
      () => createEvent(input),
      '予定の作成に失敗しました',
    )
    if (result !== undefined) {
      eventDialog.handleDialogClose(false)
    }
  }

  const handleUpdateEvent = async (input: CreateEventInput) => {
    if (!eventDialog.editingItem) return

    const eventId = eventDialog.editingItem.id
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

  const handleDeleteEvent = async (mode?: 'single' | 'all') => {
    const eventToDelete = deleteEventConfirm.deletingItem
    if (!eventToDelete) return

    const result = await execute(
      async () => {
        if (
          eventToDelete.recurrenceRule &&
          mode === 'single' &&
          eventToDelete.startDatetime
        ) {
          const eventDate = eventToDelete.startDatetime.split('T')[0]
          const currentExcludedDates =
            eventToDelete.recurrenceExcludedDates || []
          if (!currentExcludedDates.includes(eventDate)) {
            await updateEvent(eventToDelete.id, {
              recurrenceExcludedDates: [...currentExcludedDates, eventDate],
            })
          }
        } else {
          await deleteEvent(eventToDelete.id)
        }
        return true
      },
      '予定の削除に失敗しました',
    )
    if (result !== undefined) {
      deleteEventConfirm.clearDeletingItem()
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

  const handleDeleteTask = async (mode?: 'single' | 'all') => {
    const taskToDelete = deleteTaskConfirm.deletingItem
    if (!taskToDelete) return

    const result = await execute(
      async () => {
        if (
          taskToDelete.recurrenceRule &&
          mode === 'single' &&
          taskToDelete.executionDate
        ) {
          const currentExcludedDates =
            taskToDelete.recurrenceExcludedDates || []
          if (!currentExcludedDates.includes(taskToDelete.executionDate)) {
            await updateTask(taskToDelete.id, {
              recurrenceExcludedDates: [
                ...currentExcludedDates,
                taskToDelete.executionDate,
              ],
            })
          }
        } else {
          await deleteTask(taskToDelete.id)
        }
        return true
      },
      'タスクの削除に失敗しました',
    )
    if (result !== undefined) {
      deleteTaskConfirm.clearDeletingItem()
    }
  }

  const handleUpdateDiary = async (input: UpdateDailyLogInput) => {
    await execute(
      async () => {
        if (dailyLog) {
          await updateDailyLog(input)
        } else {
          await createDailyLog({ logDate: date, diary: input.diary })
        }
      },
      '日記の保存に失敗しました',
    )
  }

  const handleToggleHabit = async (habit: { id: number }) => {
    const completed = completedHabitIds.has(habit.id)
    await execute(
      async () => {
        if (completed) {
          await deleteHabitCompletion(habit.id, date)
        } else {
          await createHabitCompletion(habit.id, date)
        }
      },
      '習慣の完了状態の更新に失敗しました',
    )
  }

  const isLoading =
    isLoadingGoals ||
    isLoadingTasks ||
    isLoadingEvents ||
    isLoadingDailyLog ||
    isLoadingHabits ||
    isLoadingHabitCompletions
  const error = goalsError || tasksError || eventsError

  return (
    <>
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{formattedDate}のログ</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevDate}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">前日</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextDate}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">翌日</span>
            </Button>
          </div>
        </div>
      </div>

      <ErrorMessage
        message={operationError || error || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <LogGoalsSection
              yearlyGoals={yearlyGoals}
              monthlyGoals={monthlyGoals}
              weeklyGoals={weeklyGoals}
              currentDate={logDate}
            />
            <LogDiarySection
              dailyLog={dailyLog}
              isLoading={isLoadingDailyLog}
              onUpdate={handleUpdateDiary}
            />
          </div>
          <div className="space-y-6">
            <TimelineSection
              items={timelineItems}
              events={events}
              habits={habitsForDate}
              tasks={tasks}
              completedHabitIds={completedHabitIds}
              onEditEvent={eventDialog.handleEdit}
              onDeleteEvent={deleteEventConfirm.handleDeleteClick}
              onToggleHabit={handleToggleHabit}
              onToggleTask={handleToggleTaskCompletion}
              onEditTask={taskDialog.handleEdit}
              onDeleteTask={deleteTaskConfirm.handleDeleteClick}
            />
          </div>
        </div>
      )}

      <FloatingActionButtons
        actions={[
          {
            id: 'focus',
            label: 'フォーカスモード',
            icon: <Focus className="h-5 w-5" />,
            onClick: () => router.push('/focus'),
          },
          {
            id: 'create-event',
            label: '予定を作成',
            icon: <CalendarPlus className="h-5 w-5" />,
            onClick: eventDialog.handleCreateClick,
          },
          {
            id: 'create-task',
            label: 'タスクを作成',
            icon: <CheckSquare className="h-5 w-5" />,
            onClick: taskDialog.handleCreateClick,
          },
        ]}
      />

      <EventDialog
        open={eventDialog.isDialogOpen}
        onOpenChange={eventDialog.handleDialogClose}
        onSubmit={eventDialog.editingItem ? handleUpdateEvent : handleCreateEvent}
        event={eventDialog.editingItem}
        defaultStartDate={date}
      />

      <TaskDialog
        open={taskDialog.isDialogOpen}
        onOpenChange={taskDialog.handleDialogClose}
        onSubmit={taskDialog.editingItem ? handleUpdateTask : handleCreateTask}
        task={taskDialog.editingItem}
        defaultExecutionDate={date}
      />

      {deleteTaskConfirm.deletingItem?.recurrenceRule ? (
        <RecurringTaskDeleteDialog
          open={!!deleteTaskConfirm.deletingItem}
          taskTitle={deleteTaskConfirm.deletingItem.title}
          onConfirm={handleDeleteTask}
          onCancel={deleteTaskConfirm.handleDeleteCancel}
        />
      ) : (
        <DeleteConfirmDialog
          open={!!deleteTaskConfirm.deletingItem}
          message={`「${deleteTaskConfirm.deletingItem?.title}」を削除しますか？この操作は取り消せません。`}
          onConfirm={() => handleDeleteTask()}
          onCancel={deleteTaskConfirm.handleDeleteCancel}
        />
      )}

      {deleteEventConfirm.deletingItem?.recurrenceRule ? (
        <RecurringEventDeleteDialog
          open={!!deleteEventConfirm.deletingItem}
          eventTitle={deleteEventConfirm.deletingItem.title}
          onConfirm={handleDeleteEvent}
          onCancel={deleteEventConfirm.handleDeleteCancel}
        />
      ) : (
        <DeleteConfirmDialog
          open={!!deleteEventConfirm.deletingItem}
          message={`「${deleteEventConfirm.deletingItem?.title}」を削除しますか？この操作は取り消せません。`}
          onConfirm={() => handleDeleteEvent()}
          onCancel={deleteEventConfirm.handleDeleteCancel}
        />
      )}
      </div>
    </>
  )
}

function LogPageContent() {
  const { mode } = useMode()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')
  const date = dateParam || format(new Date(), 'yyyy-MM-dd')

  const logDate = parseISO(date)
  if (!isValid(logDate)) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">無効な日付です</h1>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  if (mode !== 'life') {
    return null
  }

  return <LogPageView logDate={logDate} date={date} />
}

export default function LogPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LogPageContent />
    </Suspense>
  )
}
