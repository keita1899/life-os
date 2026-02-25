'use client'

import { useMemo } from 'react'
import { addDays } from 'date-fns'
import { useTasks, TaskList } from '@/features/tasks'
import { toTasksWithNextOccurrenceOnly, getTasksForDate } from '@/features/tasks'
import { useDevCalendarTasks } from '@/features/dev/tasks'
import { useDevProjects } from '@/features/dev/projects'
import { getDevTasksForDate } from '@/features/dev/logs'
import { EmptyState } from '@/components/ui/empty-state'
import { useReviewTaskCrud } from '../../hooks/useReviewTaskCrud'
import { ReviewTaskDialogs } from '../ReviewTaskDialogs'
import { devTaskToTask } from '../../lib/devTaskToTask'
import type { Task } from '@/features/tasks'
import type { ReviewMode } from '../../types/review-completion'

interface EveningTomorrowStepProps {
  today: Date
  mode: ReviewMode
}

export function EveningTomorrowStep({ today, mode }: EveningTomorrowStepProps) {
  const tomorrow = useMemo(() => addDays(today, 1), [today])

  const { tasks: lifeTasks } = useTasks()
  const { tasks: devTasks } = useDevCalendarTasks()
  const { projects } = useDevProjects()

  const crud = useReviewTaskCrud(mode)

  const projectNameById = useMemo(() => {
    const map = new Map<number, string>()
    projects.forEach((p) => map.set(p.id, p.name))
    return map
  }, [projects])

  const lifeTasksTomorrow = useMemo(() => {
    const withNextOnly = toTasksWithNextOccurrenceOnly(lifeTasks, tomorrow)
    return getTasksForDate(withNextOnly, tomorrow)
  }, [lifeTasks, tomorrow])

  const devTasksTomorrow = useMemo(() => {
    const devForDate = getDevTasksForDate(devTasks, tomorrow)
    return devForDate.map(devTaskToTask)
  }, [devTasks, tomorrow])

  const tasks = mode === 'life' ? lifeTasksTomorrow : devTasksTomorrow

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
        <EmptyState message="明日のタスクはありません" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <TaskList
        tasks={tasks}
        getTaskLabel={mode === 'development' ? getTaskLabel : undefined}
        onToggleCompletion={crud.handleToggleCompletion}
        onEdit={crud.handleEdit}
        onDelete={crud.handleDelete}
        onUpdateExecutionDate={crud.handleUpdateExecutionDate}
      />
      <ReviewTaskDialogs
        editingTask={crud.editingTask}
        deletingTask={crud.deletingTask}
        onEditClose={() => crud.setEditingTask(null)}
        onEditSubmit={crud.handleEditSubmit}
        onRecurringDeleteConfirm={crud.handleRecurringDeleteConfirm}
        onDeleteCancel={() => crud.setDeletingTask(null)}
      />
    </div>
  )
}
