'use client'

import { Suspense, useMemo } from 'react'
import { getYear, parseISO } from 'date-fns'
import { getNextOccurrenceAfter } from '@/features/tasks'
import { useRouter } from 'next/navigation'
import { useFocusShortcut } from '@/hooks/useFocusShortcut'
import { CalendarPlus, CheckSquare, Focus } from 'lucide-react'
import { useGoals } from '@/features/goals'
import { useTasks } from '@/features/tasks'
import { useEvents } from '@/features/events'
import { useHabits } from '@/features/habits'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useDialogState } from '@/hooks/useDialogState'
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm'
import { useLogView } from '@/hooks/useLogView'
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { LogGoalsSection } from '@/components/logs/LogGoalsSection'
import { LogDayContent } from '@/components/logs/LogDayContent'
import { LogViewHeader } from '@/components/logs/LogViewHeader'
import { TaskDialog } from '@/features/tasks'
import { EventDialog } from '@/features/events'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { RecurringTaskDeleteDialog } from '@/features/tasks'
import { RecurringEventDeleteDialog } from '@/features/events'
import {
  getYearlyGoalsForDate,
  getMonthlyGoalsForDate,
  getWeeklyGoalsForDate,
} from '@/lib/logs/utils'
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/features/tasks'
import Link from 'next/link'
import type { CreateEventInput, Event, UpdateEventInput } from '@/features/events'
import { FloatingActionButtons } from '@/components/floating/FloatingActionButtons'

interface LogPageViewProps {
  currentDate: Date
  dateString: string
  datesToShow: Date[]
  displayTitle: string
  basePath: string
  onPrev: () => void
  onNext: () => void
}

function LogPageView({
  currentDate,
  dateString,
  datesToShow,
  displayTitle,
  basePath,
  onPrev,
  onNext,
}: LogPageViewProps) {
  const router = useRouter()
  useFocusShortcut({ path: '/focus' })
  const year = getYear(currentDate)
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
  const { habits: allHabits, isLoading: isLoadingHabits } = useHabits()

  const goalsDate = datesToShow[0] ?? currentDate
  const yearlyGoals = useMemo(
    () => getYearlyGoalsForDate(allYearlyGoals, goalsDate),
    [allYearlyGoals, goalsDate],
  )
  const monthlyGoals = useMemo(
    () => getMonthlyGoalsForDate(allMonthlyGoals, goalsDate),
    [allMonthlyGoals, goalsDate],
  )
  const weeklyGoals = useMemo(
    () => getWeeklyGoalsForDate(allWeeklyGoals, goalsDate),
    [allWeeklyGoals, goalsDate],
  )

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

  const isLoading =
    isLoadingGoals || isLoadingTasks || isLoadingEvents || isLoadingHabits
  const error = goalsError || tasksError || eventsError

  return (
    <>
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <LogViewHeader
          displayTitle={displayTitle}
          basePath={basePath}
          onPrev={onPrev}
          onNext={onNext}
        />

      <ErrorMessage
        message={operationError || error || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <div className="space-y-8">
          <LogGoalsSection
            yearlyGoals={yearlyGoals}
            monthlyGoals={monthlyGoals}
            weeklyGoals={weeklyGoals}
            currentDate={goalsDate}
          />
          {datesToShow.map((logDate) => (
            <div key={logDate.toISOString()} className="space-y-6">
              <LogDayContent
                logDate={logDate}
                allTasks={allTasks}
                allEvents={allEvents}
                allHabits={allHabits}
                execute={execute}
                onToggleTask={handleToggleTaskCompletion}
                onEditTask={taskDialog.handleEdit}
                onDeleteTask={deleteTaskConfirm.handleDeleteClick}
                onEditEvent={eventDialog.handleEdit}
                onDeleteEvent={deleteEventConfirm.handleDeleteClick}
              />
            </div>
          ))}
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
        defaultStartDate={dateString}
      />

      <TaskDialog
        open={taskDialog.isDialogOpen}
        onOpenChange={taskDialog.handleDialogClose}
        onSubmit={taskDialog.editingItem ? handleUpdateTask : handleCreateTask}
        task={taskDialog.editingItem}
        defaultExecutionDate={dateString}
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
  const logView = useLogView({ basePath: '/logs' })

  if (!logView.isValidDate) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
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

  return (
    <LogPageView
      currentDate={logView.currentDate}
      dateString={logView.dateString}
      datesToShow={logView.datesToShow}
      displayTitle={logView.displayTitle}
      basePath="/logs"
      onPrev={logView.handlePrev}
      onNext={logView.handleNext}
    />
  )
}

export default function LogPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LogPageContent />
    </Suspense>
  )
}
