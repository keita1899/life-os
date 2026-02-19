'use client'

import { useMemo } from 'react'
import { useTasks } from '@/features/tasks'
import { useDevCalendarTasks, getDevTasksCompletedInWeek } from '@/features/dev/tasks'
import { useDevProjects } from '@/features/dev/projects'
import { getTasksCompletedInWeek } from '@/features/tasks'
import { TaskList } from '@/features/tasks'
import type { Task } from '@/features/tasks'
import type { ReviewMode } from '../../types/review-completion'

interface WeekEndCompletedTasksStepProps {
  weekStartDateStr: string
  weekEndDateStr: string
  mode: ReviewMode
}

function devTaskToTask(devTask: {
  id: number
  title: string
  executionDate: string | null
  completed: boolean
  order: number
  memo: string | null
  createdAt: string
  updatedAt: string
}): Task {
  return {
    id: devTask.id,
    title: devTask.title,
    executionDate: devTask.executionDate ?? '',
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
  }
}

export function WeekEndCompletedTasksStep({
  weekStartDateStr,
  weekEndDateStr,
  mode,
}: WeekEndCompletedTasksStepProps) {
  const { tasks: lifeTasks } = useTasks()
  const { tasks: devTasks } = useDevCalendarTasks()
  const { projects } = useDevProjects()

  const projectNameById = useMemo(() => {
    const map = new Map<number, string>()
    projects.forEach((p) => map.set(p.id, p.name))
    return map
  }, [projects])

  const lifeCompleted = useMemo(
    () =>
      getTasksCompletedInWeek(lifeTasks, weekStartDateStr, weekEndDateStr),
    [lifeTasks, weekStartDateStr, weekEndDateStr],
  )
  const devCompleted = useMemo(
    () =>
      getDevTasksCompletedInWeek(devTasks, weekStartDateStr, weekEndDateStr),
    [devTasks, weekStartDateStr, weekEndDateStr],
  )

  const tasks = mode === 'life' ? lifeCompleted : devCompleted.map(devTaskToTask)

  const getTaskLabel = (task: Task) => {
    if (mode !== 'development') return undefined
    const devTask = devTasks.find((t) => t.id === task.id)
    if (!devTask) return undefined
    return devTask.projectId
      ? projectNameById.get(devTask.projectId) ?? `プロジェクト#${devTask.projectId}`
      : devTask.type === 'learning'
        ? '学習'
        : 'Inbox'
  }

  return (
    <div className="space-y-5">
      <TaskList
        tasks={tasks}
        getTaskLabel={mode === 'development' ? getTaskLabel : undefined}
        dateLabelMode="all"
      />
    </div>
  )
}
