'use client'

import { useMemo } from 'react'
import { useTasks } from '@/features/tasks'
import {
  useDevCalendarTasks,
  getOverdueDevTasksInWeek,
} from '@/features/dev/tasks'
import { useDevProjects } from '@/features/dev/projects'
import { getOverdueTasksInWeek } from '@/features/tasks'
import { TaskList } from '@/features/tasks'
import { EmptyState } from '@/components/ui/empty-state'
import type { Task } from '@/features/tasks'
import type { ReviewMode } from '../../types/review-completion'

interface WeekEndOverdueStepProps {
  weekStartDateStr: string
  beforeDateStr: string
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

export function WeekEndOverdueStep({
  weekStartDateStr,
  beforeDateStr,
  mode,
}: WeekEndOverdueStepProps) {
  const { tasks: lifeTasks } = useTasks()
  const { tasks: devTasks } = useDevCalendarTasks()
  const { projects } = useDevProjects()

  const projectNameById = useMemo(() => {
    const map = new Map<number, string>()
    projects.forEach((p) => map.set(p.id, p.name))
    return map
  }, [projects])

  const lifeOverdue = useMemo(
    () => getOverdueTasksInWeek(lifeTasks, weekStartDateStr, beforeDateStr),
    [lifeTasks, weekStartDateStr, beforeDateStr],
  )
  const devOverdue = useMemo(
    () =>
      getOverdueDevTasksInWeek(devTasks, weekStartDateStr, beforeDateStr),
    [devTasks, weekStartDateStr, beforeDateStr],
  )

  const tasks = mode === 'life' ? lifeOverdue : devOverdue.map(devTaskToTask)

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

  if (tasks.length === 0) {
    return (
      <div className="space-y-5">
        <EmptyState message="今週の期限切れタスクはありません" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <TaskList
        tasks={tasks}
        getTaskLabel={mode === 'development' ? getTaskLabel : undefined}
        dateLabelMode="overdue-only"
      />
    </div>
  )
}
