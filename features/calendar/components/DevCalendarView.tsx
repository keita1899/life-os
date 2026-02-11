'use client'

import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { CalendarViewBase } from './CalendarViewBase'
import { MonthlyGoalCalendarForm } from '@/components/dev/goals/MonthlyGoalCalendarForm'
import { WeeklyGoalForm } from '@/components/dev/goals/WeeklyGoalForm'
import { useDevGoals } from '@/hooks/useDevGoals'
import { useDevCalendarTasks } from '@/hooks/useDevCalendarTasks'
import { useDevProjects } from '@/hooks/useDevProjects'
import { useCalendarView } from '../hooks/useCalendarView'
import { useAsyncOperation } from '@/hooks/useAsyncOperation'
import { useMemo, useState } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { getHolidaysForDateRange } from '../lib/holidays'
import type { Task } from '@/features/tasks'
import { TaskDialog } from '@/features/tasks'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { ErrorMessage } from '@/components/ui/error-message'
import type { CreateTaskInput } from '@/features/tasks'
import type { DevTask } from '@/lib/types/dev-task'
import { deleteDevTask, updateDevTask } from '@/lib/dev/tasks'
import { mutate } from 'swr'

interface DevCalendarViewProps {
  initialDate?: Date
}

export function DevCalendarView({ initialDate }: DevCalendarViewProps) {
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
  } = useDevGoals(currentYear)

  const {
    tasks: devTasks,
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useDevCalendarTasks()
  const {
    projects,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useDevProjects()

  const projectNameById = useMemo(() => {
    const map = new Map<number, string>()
    projects.forEach((p) => map.set(p.id, p.name))
    return map
  }, [projects])

  const devTaskById = useMemo(() => {
    const map = new Map<number, DevTask>()
    devTasks.forEach((t) => map.set(t.id, t))
    return map
  }, [devTasks])

  const calendarTasks: Task[] = useMemo(() => {
    return devTasks
      .filter((t) => t.executionDate !== null)
      .map((t) => {
        const prefix = t.projectId
          ? projectNameById.get(t.projectId) ?? `プロジェクト#${t.projectId}`
          : t.type === 'learning'
            ? '学習'
            : 'Inbox'

        return {
          id: t.id,
          title: `${prefix}: ${t.title}`,
          executionDate: t.executionDate,
          completed: t.completed,
          order: t.order,
          scheduledTime: null,
          recurrenceRule: null,
          recurrenceDaysOfWeek: null,
          recurrenceDayOfMonth: null,
          recurrenceEndDate: null,
          recurrenceExcludedDates: [],
          memo: t.memo,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        }
      })
  }, [devTasks, projectNameById])

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
  const holidays = useMemo(
    () => getHolidaysForDateRange(rangeStart, rangeEnd),
    [rangeStart, rangeEnd],
  )

  const isLoading =
    isLoadingGoals || isLoadingTasks || isLoadingProjects || isLoadingSettings

  const { operationError, setOperationError, execute } = useAsyncOperation()
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [deletingTask, setDeletingTask] = useState<Task | undefined>(undefined)

  const handleEditTask = (task: Task) => {
    const devTask = devTaskById.get(task.id)
    if (!devTask) return

    setEditingTask({
      id: devTask.id,
      title: devTask.title,
      executionDate: devTask.executionDate,
      completed: devTask.completed,
      order: devTask.order,
      scheduledTime: null,
      recurrenceRule: null,
      recurrenceDaysOfWeek: null,
      recurrenceDayOfMonth: null,
      recurrenceEndDate: null,
      recurrenceExcludedDates: [],
      memo: devTask.memo,
      createdAt: devTask.createdAt,
      updatedAt: devTask.updatedAt,
    })
    setIsTaskDialogOpen(true)
  }

  const handleUpdateTask = async (input: CreateTaskInput) => {
    if (!editingTask) return

    const taskId = editingTask.id
    const result = await execute(
      async () => {
        await updateDevTask(taskId, {
          title: input.title,
          executionDate: input.executionDate,
          memo: input.memo,
        })
        await mutate('dev-calendar-tasks')
        return true
      },
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
        await deleteDevTask(taskToDelete.id)
        await mutate('dev-calendar-tasks')
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
        await updateDevTask(task.id, { completed: !task.completed })
        await mutate('dev-calendar-tasks')
      },
      'タスクの完了状態の更新に失敗しました',
    )
  }

  return (
    <>
      <ErrorMessage
        message={operationError || tasksError || projectsError || ''}
        onDismiss={operationError ? () => setOperationError(null) : undefined}
      />
      <CalendarViewBase
        displayTitle={displayTitle}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        isLoading={isLoading}
        cardClassName="bg-transparent"
      >
        {viewMode === 'month' && (
          <MonthlyGoalCalendarForm
            currentDate={currentDate}
            monthlyGoals={monthlyGoals}
          />
        )}
        {viewMode === 'week' && (
          <WeeklyGoalForm
            currentDate={currentDate}
            weeklyGoals={weeklyGoals}
            weekStartDay={weekStartDay}
          />
        )}
        {viewMode === 'month' ? (
          <MonthView
            currentDate={currentDate}
            events={[]}
            tasks={calendarTasks}
            weekStartDay={weekStartDay}
            holidays={holidays}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTaskClick}
            onToggleTaskCompletion={handleToggleTaskCompletion}
          />
        ) : (
          <WeekView
            currentDate={currentDate}
            weeklyGoals={weeklyGoals}
            events={[]}
            tasks={calendarTasks}
            weekStartDay={weekStartDay}
            showWeeklyGoalForm={false}
            holidays={holidays}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTaskClick}
            onToggleTaskCompletion={handleToggleTaskCompletion}
          />
        )}
      </CalendarViewBase>

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
