'use client'

import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { CalendarViewBase } from './CalendarViewBase'
import { MonthlyGoalCalendarForm } from '@/components/dev/goals/MonthlyGoalCalendarForm'
import { WeeklyGoalForm } from '@/components/dev/goals/WeeklyGoalForm'
import { useDevGoals } from '@/hooks/useDevGoals'
import { useDevCalendarTasks } from '@/hooks/useDevCalendarTasks'
import { useDevProjects } from '@/hooks/useDevProjects'
import { useCalendarView } from '@/hooks/useCalendarView'
import { useMemo, useState } from 'react'
import type { Task } from '@/lib/types/task'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { ErrorMessage } from '@/components/ui/error-message'
import type { CreateTaskInput } from '@/lib/types/task'
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
          actualTime: t.actualTime,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        }
      })
  }, [devTasks, projectNameById])

  const isLoading =
    isLoadingGoals || isLoadingTasks || isLoadingProjects || isLoadingSettings

  const [operationError, setOperationError] = useState<string | null>(null)
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
      actualTime: devTask.actualTime,
      createdAt: devTask.createdAt,
      updatedAt: devTask.updatedAt,
    })
    setIsTaskDialogOpen(true)
  }

  const handleUpdateTask = async (input: CreateTaskInput) => {
    if (!editingTask) return

    try {
      setOperationError(null)
      await updateDevTask(editingTask.id, {
        title: input.title,
        executionDate: input.executionDate,
      })
      await mutate('dev-calendar-tasks')
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
      await deleteDevTask(deletingTask.id)
      await mutate('dev-calendar-tasks')
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
      await updateDevTask(task.id, { completed: !task.completed })
      await mutate('dev-calendar-tasks')
    } catch (err) {
      setOperationError(
        err instanceof Error ? err.message : 'タスクの完了状態の更新に失敗しました',
      )
    }
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
            monthlyGoals={monthlyGoals}
            events={[]}
            tasks={calendarTasks}
            weekStartDay={weekStartDay}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTaskClick}
            onToggleTaskCompletion={handleToggleTaskCompletion}
          />
        ) : (
          <WeekView
            currentDate={currentDate}
            monthlyGoals={monthlyGoals}
            weeklyGoals={weeklyGoals}
            events={[]}
            tasks={calendarTasks}
            weekStartDay={weekStartDay}
            showWeeklyGoalForm={false}
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
