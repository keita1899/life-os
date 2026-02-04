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
import { Loading } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error-message'
import { MainLayout } from '@/components/layout/MainLayout'
import { LogGoalsSection } from '@/components/logs/LogGoalsSection'
import { LogHabitsSection } from '@/components/logs/LogHabitsSection'
import { LogTasksSection } from '@/components/logs/LogTasksSection'
import { LogEventsSection } from '@/components/logs/LogEventsSection'
import { LogDiarySection } from '@/components/logs/LogDiarySection'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { EventDialog } from '@/components/events/EventDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
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
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined)
  const [deletingEvent, setDeletingEvent] = useState<Event | undefined>(undefined)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [deletingTask, setDeletingTask] = useState<Task | undefined>(undefined)
  const [operationError, setOperationError] = useState<string | null>(null)
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
    const filtered = allHabits.filter((h) => isHabitDueOnDate(h, logDate))
    const normalizeTime = (t: string | null): string => {
      if (!t?.trim()) return '99:99'
      const parts = t.trim().split(':')
      const h = (parts[0] ?? '0').padStart(2, '0')
      const m = (parts[1] ?? '0').padStart(2, '0')
      return `${h}:${m}`
    }
    return [...filtered].sort((a, b) =>
      normalizeTime(a.scheduledTime).localeCompare(
        normalizeTime(b.scheduledTime),
      ),
    )
  }, [allHabits, logDate])

  const completedHabitIds = useMemo(
    () => new Set(habitCompletions.map((c) => c.habitId)),
    [habitCompletions],
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

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleOpenCreateTask = () => {
    setEditingTask(undefined)
    setIsTaskDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsTaskDialogOpen(open)
    if (!open) {
      setEditingTask(undefined)
    }
  }

  const handleCreateTask = async (input: CreateTaskInput) => {
    try {
      setOperationError(null)
      await createTask(input)
      setIsTaskDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの作成に失敗しました',
      )
    }
  }

  const handleUpdateTask = async (input: CreateTaskInput) => {
    if (!editingTask) return

    try {
      setOperationError(null)
      const updateInput: UpdateTaskInput = {
        title: input.title,
        executionDate: input.executionDate,
        recurrenceRule: input.recurrenceRule,
        recurrenceDaysOfWeek: input.recurrenceDaysOfWeek,
        recurrenceDayOfMonth: input.recurrenceDayOfMonth,
        recurrenceEndDate: input.recurrenceEndDate,
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

  const handleOpenCreateEvent = () => {
    setEditingEvent(undefined)
    setIsEventDialogOpen(true)
  }

  const handleCreateEvent = async (input: CreateEventInput) => {
    try {
      setOperationError(null)
      await createEvent(input)
      setIsEventDialogOpen(false)
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '予定の作成に失敗しました',
      )
    }
  }

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

  const handleDeleteClick = (task: Task) => {
    setDeletingTask(task)
  }

  const handleToggleTaskCompletion = async (task: Task) => {
    try {
      setOperationError(null)
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
    } catch (err) {
      setOperationError(
        err instanceof Error
          ? err.message
          : 'タスクの完了状態の更新に失敗しました',
      )
    }
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

  const handleUpdateDiary = async (input: UpdateDailyLogInput) => {
    try {
      setOperationError(null)
      if (dailyLog) {
        await updateDailyLog(input)
      } else {
        await createDailyLog({ logDate: date, diary: input.diary })
      }
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '日記の保存に失敗しました',
      )
    }
  }

  const handleUpdateExecutionDate = async (
    task: Task,
    executionDate: string | null,
  ) => {
    try {
      setOperationError(null)
      await updateTask(task.id, { executionDate })
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの実行日の更新に失敗しました',
      )
    }
  }

  const handleToggleHabit = async (habit: { id: number }) => {
    const completed = completedHabitIds.has(habit.id)
    try {
      setOperationError(null)
      if (completed) {
        await deleteHabitCompletion(habit.id, date)
      } else {
        await createHabitCompletion(habit.id, date)
      }
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : '習慣の完了状態の更新に失敗しました',
      )
    }
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
    <MainLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
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
        <div className="space-y-6">
          <LogGoalsSection
            yearlyGoals={yearlyGoals}
            monthlyGoals={monthlyGoals}
            weeklyGoals={weeklyGoals}
          />
          <LogHabitsSection
            habits={habitsForDate}
            completedHabitIds={completedHabitIds}
            onToggle={handleToggleHabit}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <LogEventsSection
              events={events}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEventClick}
            />
            <LogTasksSection
              tasks={tasks}
              onToggleCompletion={handleToggleTaskCompletion}
              onEdit={handleEditTask}
              onDelete={handleDeleteClick}
              onUpdateExecutionDate={handleUpdateExecutionDate}
            />
          </div>
          <LogDiarySection
            dailyLog={dailyLog}
            isLoading={isLoadingDailyLog}
            onUpdate={handleUpdateDiary}
          />
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
            onClick: handleOpenCreateEvent,
          },
          {
            id: 'create-task',
            label: 'タスクを作成',
            icon: <CheckSquare className="h-5 w-5" />,
            onClick: handleOpenCreateTask,
          },
        ]}
      />

      <EventDialog
        open={isEventDialogOpen}
        onOpenChange={(open) => {
          setIsEventDialogOpen(open)
          if (!open) {
            setEditingEvent(undefined)
          }
        }}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
        event={editingEvent}
        defaultStartDate={date}
      />

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        defaultExecutionDate={date}
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
      </div>
    </MainLayout>
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
    <Suspense fallback={<div className="container mx-auto max-w-4xl py-8 px-4">読み込み中...</div>}>
      <LogPageContent />
    </Suspense>
  )
}
